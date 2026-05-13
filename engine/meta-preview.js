export function renderPreview(entity) {
  return `
<!doctype html>
<html>
<head>

<meta charset="utf-8">

<meta property="og:title" content="${entity.title}">
<meta property="og:description" content="${entity.summary}">
<meta property="og:image" content="${entity.image}">
<meta property="og:url" content="${entity.url}">
<meta property="og:type" content="article">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${entity.title}">
<meta name="twitter:description" content="${entity.summary}">
<meta name="twitter:image" content="${entity.image}">

</head>
<body>
Redirecting...
</body>
</html>`;
}
