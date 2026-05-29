// This file runs in a Web Worker context
// It handles transformer inference off the main thread

let pipeline: any = null;

interface InferenceRequest {
  id: string;
  prompt: string;
  options: {
    max_new_tokens: number;
    temperature: number;
    top_p: number;
    do_sample: boolean;
    return_full_text: boolean;
  };
}

interface InferenceResponse {
  id: string;
  result: string;
  error?: string;
}

// Initialize the transformer pipeline
async function initializePipeline() {
  if (pipeline) return;

  try {
    const { pipeline: createPipeline } = await import("@xenova/transformers");
    pipeline = await createPipeline("text-generation", "Xenova/distilgpt2");
    postMessage({ type: "initialized", success: true });
  } catch (error) {
    console.error("Failed to initialize pipeline in worker:", error);
    postMessage({ type: "initialized", success: false, error: String(error) });
  }
}

// Handle inference requests
async function performInference(request: InferenceRequest) {
  try {
    if (!pipeline) {
      await initializePipeline();
    }

    if (!pipeline) {
      throw new Error("Pipeline failed to initialize");
    }

    const response = await pipeline(request.prompt, request.options);
    const generatedText = Array.isArray(response)
      ? response[0]?.generated_text
      : response?.generated_text;

    postMessage({
      type: "inference",
      id: request.id,
      result: String(generatedText),
    } as InferenceResponse);
  } catch (error) {
    console.error("Inference error:", error);
    postMessage({
      type: "inference",
      id: request.id,
      error: String(error),
    } as InferenceResponse);
  }
}

// Message handler
self.onmessage = async (event: MessageEvent<InferenceRequest>) => {
  const { data } = event;

  if (data.type === "init") {
    await initializePipeline();
  } else if (data.type === "infer") {
    await performInference(data);
  }
};

// Notify main thread that worker is ready
postMessage({ type: "ready" });
