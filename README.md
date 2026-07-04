# SillyTavern Scene Image Generator

A SillyTavern third-party extension for generating images from the current roleplay scene.

The extension reads the latest chat turns, rewrites the scene into an image prompt with either the current SillyTavern chat model or a custom OpenAI-compatible chat API, then sends the prompt to a selected image API profile.

## Features

- Multiple image API profiles.
- First provider: OpenAI-compatible `/v1/images/generations`.
- Scene prompt rewriting with the current SillyTavern model by default.
- Optional custom rewrite API URL, key, and model.
- Adjustable recent-turn context window.
- Result preview, generated prompt display, and prompt copy.

## Install

In SillyTavern, install this repository as a third-party extension by URL.

For local development, copy or symlink this folder to:

```text
data/default-user/extensions/sillytavern-scene-image-generator
```

Then reload SillyTavern.

## Image API Profile

For OpenAI-compatible image APIs, set:

- Base URL: `https://api.example.com/v1`
- Model: `gpt-image-1` or your provider's image model
- API key: your provider key
- Size: for example `1024x1024`
- Response format: `b64_json` or `url`

Extra params must be a JSON object. They are merged into the image generation request.

## Roadmap

- Stable Diffusion WebUI provider.
- ComfyUI provider.
- Insert generated image into the current chat.
- Per-character prompt presets.
