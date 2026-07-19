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
      errorMsg = `画像選択に失敗しました: ${err}`;
      console.error(err);
    }
  }

  async function extractText(path: string) {
    try {
      isExtracting = true;
      errorMsg = null;
      extractedText = await invoke("extract_text", { filePath: path });
    } catch (err) {
      errorMsg = `テキスト抽出に失敗しました: ${err}`;
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
      errorMsg = `テキストのコピーに失敗しました: ${err}`;
      console.error(err);
    }
  }
</script>

<main class="min-h-screen bg-zinc-50 p-8 flex items-center justify-center">
  <div class="w-full max-w-5xl">
    {#if errorMsg}
      <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6">
        <p class="text-red-700">{errorMsg}</p>
      </div>
    {/if}

    <div class="bg-white p-8 rounded-2xl shadow-lg border border-zinc-200">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <!-- Image Section (Left) -->
        <div class="space-y-4 flex flex-col">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-zinc-800">画像</h2>
            <button
              class="px-5 py-2.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors text-sm font-semibold shadow-sm focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
              onclick={handleSelectImage}
              disabled={isExtracting}
            >
              ファイル選択
            </button>
          </div>

          <div class="flex-1 min-h-[400px] bg-zinc-100 rounded-xl border-2 border-dashed border-zinc-300 flex items-center justify-center overflow-hidden relative group">
            {#if imageUrl}
              <img src={imageUrl} alt="Selected source" class="absolute inset-0 w-full h-full object-contain p-2" />
            {:else}
              <div class="text-zinc-400 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-16 w-16 mb-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p class="text-sm font-medium">画像が選択されていません</p>
              </div>
            {/if}
          </div>
        </div>

        <!-- Text Section (Right) -->
        <div class="space-y-4 flex flex-col">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-zinc-800">抽出結果</h2>
            <button
              class="px-5 py-2.5 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors text-sm font-semibold border border-zinc-200 focus:ring-2 focus:ring-zinc-200 focus:ring-offset-2 focus:outline-none disabled:opacity-50 flex items-center gap-2"
              onclick={handleCopy}
              disabled={!extractedText || isExtracting}
            >
              {#if copySuccess}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                コピーしました
              {:else}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                コピー
              {/if}
            </button>
          </div>

          <div class="relative flex-1 min-h-[400px]">
            <textarea
              class="absolute inset-0 w-full h-full p-5 bg-zinc-50 border border-zinc-200 rounded-xl resize-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none disabled:bg-zinc-100 text-zinc-700 leading-relaxed"
              placeholder={isExtracting ? "テキストを抽出中..." : "抽出されたテキストがここに表示されます"}
              bind:value={extractedText}
              disabled={isExtracting}
            ></textarea>
            {#if isExtracting}
              <div class="absolute inset-0 bg-white/60 flex items-center justify-center rounded-xl backdrop-blur-[2px] z-10">
                <div class="flex flex-col items-center gap-3">
                  <div class="animate-spin rounded-full h-10 w-10 border-4 border-zinc-200 border-t-zinc-900"></div>
                  <span class="text-sm font-medium text-zinc-600">処理中...</span>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
</main>
