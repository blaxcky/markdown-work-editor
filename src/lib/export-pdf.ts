import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

async function markdownToHtml(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(markdown);
  return String(result);
}

function wrapHtml(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 800px; margin: 0 auto; padding: 20px; }
  h1 { font-size: 2em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
  h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
  h3 { font-size: 1.25em; }
  code { background: #f5f5f5; padding: 0.2em 0.4em; border-radius: 3px; font-size: 0.9em; }
  pre { background: #f5f5f5; padding: 16px; border-radius: 6px; overflow-x: auto; }
  pre code { background: none; padding: 0; }
  blockquote { border-left: 4px solid #ddd; margin-left: 0; padding-left: 16px; color: #666; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
  th { background: #f5f5f5; font-weight: 600; }
  img { max-width: 100%; }
  .page-break { page-break-before: always; }
  del { text-decoration: line-through; }
  input[type="checkbox"] { margin-right: 0.5em; }
</style>
</head>
<body>${bodyHtml}</body>
</html>`;
}

export interface PdfOptions {
  pageSize?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
}

export async function exportSinglePdf(
  markdown: string,
  fileName: string,
  options: PdfOptions = {}
) {
  const { pageSize = 'a4', orientation = 'portrait' } = options;
  const html = await markdownToHtml(markdown);
  const fullHtml = wrapHtml(html);

  const html2pdf = (await import('html2pdf.js')).default;

  const container = document.createElement('div');
  container.innerHTML = fullHtml;
  document.body.appendChild(container);

  try {
    await html2pdf()
      .set({
        margin: [15, 15, 15, 15],
        filename: fileName.replace(/\.md$/, '.pdf'),
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: pageSize, orientation },
      })
      .from(container)
      .save();
  } finally {
    document.body.removeChild(container);
  }
}

export async function exportMultiplePdf(
  files: { name: string; content: string }[],
  fileName: string,
  options: PdfOptions = {}
) {
  const { pageSize = 'a4', orientation = 'portrait' } = options;

  const htmlParts = await Promise.all(
    files.map(async (file, index) => {
      const html = await markdownToHtml(file.content);
      const pageBreak = index > 0 ? '<div class="page-break"></div>' : '';
      return `${pageBreak}<h1>${file.name.replace(/\.md$/, '')}</h1>${html}`;
    })
  );

  const fullHtml = wrapHtml(htmlParts.join('\n'));

  const html2pdf = (await import('html2pdf.js')).default;

  const container = document.createElement('div');
  container.innerHTML = fullHtml;
  document.body.appendChild(container);

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (html2pdf() as any)
      .set({
        margin: [15, 15, 15, 15],
        filename: fileName,
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: pageSize, orientation },
        pagebreak: { mode: ['avoid-all', 'css'] },
      })
      .from(container)
      .save();
  } finally {
    document.body.removeChild(container);
  }
}
