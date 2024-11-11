# LLM add-in for Excel

LLM add-in for Excel is a free, open-source Excel add-in that allows you to use GPT and Anthropic AI models directly within Excel spreadsheets.

## Features

- Integrate OpenAI and Anthropic AI models into your Excel workflows
- Use custom functions to generate AI responses based on cell inputs
- Support for both standard and streaming completions
- Easy-to-use interface with clear documentation

## How to Use

### PROMPT Function

Use the PROMPT function for standard completions:

```excel
=PROMPT(message, model, apiKey, systemPrompt, provider)
```

### PROMPT_STREAM Function

For streaming responses, use the PROMPT_STREAM function:

```excel
=PROMPT_STREAM(message, model, apiKey, systemPrompt, provider)
```

### Parameters

- `message`: The prompt message to send to the AI.
- `model`: The AI model to use (see provider documentation for available models).
- `apiKey`: Your API key for the chosen provider.
- `systemPrompt`:  A system prompt to provide context for the AI.
- `provider`: The AI provider to use ("openai" or "anthropic").

## Privacy

Your queries are sent directly to OpenAI/Anthropic servers. No data is stored by Liminity AB.

## Documentation

For more detailed information on available models:
- [OpenAI Models](https://platform.openai.com/docs/models)
- [Anthropic Models](https://docs.anthropic.com/en/docs/about-claude/models)

## Contributing

We welcome contributions to LLM add-in for Excel! As an open-source project, we appreciate any help, from bug reports to feature additions. Here's how you can contribute:

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes and commit them with a clear message
4. Push your changes to your fork
5. Create a pull request to the main repository


## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.

## About

LLM add-in for Excel is developed and maintained by [Liminity AB](https://liminity.se).