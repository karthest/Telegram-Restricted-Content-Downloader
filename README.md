# Telegram Restricted Content Downloader

This is a web extension that allows you to download text, photo, image, audio(more content type are coming...) from [Telegram](web.telegram.org)(both k and a version) with just one click.

Get it from [Chrome Web Store](https://chromewebstore.google.com/detail/telegram-restrcted-conten/oiaaacjagllkcoookaphpkghhiopejco?hl=en-GB&authuser=0)

## Getting Started

First, run the development server:

```bash
pnpm dev
# or
npm run dev
```

Open your browser and load the appropriate development build. For example, if you are developing for the chrome browser, using manifest v3, use: `build/chrome-mv3-dev`.

For further guidance, [visit plasmo Documentation](https://docs.plasmo.com/)

## Making production build

Run the following:

```bash
pnpm build
# or
npm run build
```

This should create a production bundle for your extension, ready to be zipped and published to the stores.
