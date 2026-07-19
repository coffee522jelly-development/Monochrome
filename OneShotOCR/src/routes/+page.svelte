<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";
  import { open } from "@tauri-apps/plugin-dialog";
  import { convertFileSrc } from "@tauri-apps/api/core";

  let imagePath = $state<string | null>(null);
  let imageUrl = $state<string | null>(null);
  let extractedText = $state("");
  let isExtracting = $state(false);
  let errorMsg = $state<string | null>(null);
  let copySuccess = $state(false);

  async function handleSelectImage() {
    try {
      errorMsg = null;
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'Images',
          extensions: ['png', 'jpeg', 'jpg', 'bmp', 'gif', 'webp']
        }]
      });

      if (selected) {
        imagePath = selected as string;
        imageUrl = convertFileSrc(imagePath);
        await extractText(imagePath);
      }
    } catch (err) {
      errorMsg = `Failed to select image: ${err}`;
      console.error(err);
    }
  }

  async function extractText(path: string) {
    try {
      isExtracting = true;
      errorMsg = null;
      extractedText = await invoke("extract_text", { filePath: path });
    } catch (err) {
      errorMsg = `Failed to extract text: ${err}`;
      console.error(err);
    } finally {
      isExtracting = false;
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(extractedText);
      copySuccess = true;
      setTimeout(() => {
        copySuccess = false;
      }, 2000);
    } catch (err) {
      errorMsg = `Failed to copy text: ${err}`;
      console.error(err);
    }
  }
</script>

<main class="min-h-screen bg-zinc-50 p-8">
  <div class="max-w-4xl mx-auto space-y-8">
    <div class="text-center">
      <h1 class="text-4xl font-bold text-zinc-900 tracking-tight">OneShotOCR</h1>
      <p class="text-zinc-500 mt-2">Select an image to extract text using Windows OCR</p>
    </div>

    {#if errorMsg}
      <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
        <p class="text-red-700">{errorMsg}</p>
      </div>
    {/if}

    <div class="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Image Section -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-zinc-800">Source Image</h2>
            <button
              class="px-4 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 transition-colors text-sm font-medium focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 focus:outline-none"
              onclick={handleSelectImage}
              disabled={isExtracting}
            >
              Select Image
            </button>
          </div>

          <div class="aspect-video bg-zinc-100 rounded-lg border-2 border-dashed border-zinc-300 flex items-center justify-center overflow-hidden">
            {#if imageUrl}
              <img src={imageUrl} alt="Selected source" class="w-full h-full object-contain" />
            {:else}
              <div class="text-zinc-400 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>No image selected</p>
              </div>
            {/if}
          </div>
        </div>

        <!-- Text Section -->
        <div class="space-y-4 flex flex-col">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-zinc-800">Extracted Text</h2>
            <button
              class="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-md hover:bg-zinc-200 transition-colors text-sm font-medium focus:ring-2 focus:ring-zinc-200 focus:ring-offset-2 focus:outline-none disabled:opacity-50 flex items-center gap-2"
              onclick={handleCopy}
              disabled={!extractedText || isExtracting}
            >
              {#if copySuccess}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              {:else}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              {/if}
            </button>
          </div>

          <div class="relative flex-1 min-h-[300px]">
            <textarea
              class="w-full h-full p-4 bg-zinc-50 border border-zinc-200 rounded-lg resize-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none disabled:bg-zinc-100"
              placeholder={isExtracting ? "Extracting text..." : "Extracted text will appear here..."}
              bind:value={extractedText}
              disabled={isExtracting}
            ></textarea>
            {#if isExtracting}
              <div class="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg backdrop-blur-[1px]">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
</main>
