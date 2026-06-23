# Transparency

Asset Bento defaults to white backgrounds. White backgrounds preserve soft shadows and glassy product illustration styles better than naive alpha extraction.

Supported brief modes:

- `white`
- `native-transparent`
- `experimental-white-to-alpha`

The MVP maps `native-transparent` to provider-native transparency when available. White-to-alpha post-processing is intentionally not the default.
