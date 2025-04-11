
export const generatePreviewHTML = (title: string, contentHtml: string) => {
  return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      color: #333;
      line-height: 1.6;
    }
    .prose {
      max-width: 65ch;
      margin: 0 auto;
    }
    .prose h1 {
      font-size: 2.25rem;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 1.5rem;
      color: #166534;
    }
    .prose h2 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-top: 2rem;
      margin-bottom: 1rem;
      color: #166534;
    }
    .prose h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
      color: #166534;
    }
    .prose p {
      margin-bottom: 1rem;
    }
    .prose ul, .prose ol {
      margin-top: 1rem;
      margin-bottom: 1rem;
      padding-left: 2rem;
    }
    .prose ul li {
      list-style-type: disc;
      margin-bottom: 0.5rem;
    }
    .prose ol li {
      list-style-type: decimal;
      margin-bottom: 0.5rem;
    }
    .prose a {
      color: #047857;
      text-decoration: underline;
    }
    .prose a:hover {
      color: #065f46;
    }
    .prose blockquote {
      border-left: 4px solid #047857;
      padding-left: 1rem;
      font-style: italic;
      margin-top: 1.5rem;
      margin-bottom: 1.5rem;
      color: #6b7280;
    }
    .prose img {
      max-width: 100%;
      height: auto;
      margin: 2rem auto;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      display: block;
    }
    .prose strong {
      font-weight: 600;
    }
    .prose em {
      font-style: italic;
    }
    .prose code {
      font-family: monospace;
      background-color: #f3f4f6;
      padding: 0.2rem 0.4rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
    }
    .prose pre {
      background-color: #f3f4f6;
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      margin-top: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .prose table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .prose table th {
      background-color: #f3f4f6;
      padding: 0.75rem;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #e5e7eb;
    }
    .prose table td {
      padding: 0.75rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .prose table tr:last-child td {
      border-bottom: none;
    }
    .prose hr {
      border: 0;
      border-top: 1px solid #e5e7eb;
      margin-top: 2rem;
      margin-bottom: 2rem;
    }
  </style>
</head>
<body>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-4xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
      <div class="p-6 md:p-8">
        <div class="prose">
          ${contentHtml}
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
};
