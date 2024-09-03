/* global console, document, Excel, Office */

// The initialize function must be run each time a new page is loaded
Office.onReady(() => {
  document.getElementById("insert-llm-setup").onclick = insertLLMSetup;
});

async function insertLLMSetup() {
  try {
    await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();

      const configRange = sheet.getRange("A1:B9");
      configRange.values = [
        ["Config", ""],
        ["System Prompt", "You are a helpful assistant, always respond in CAPITAL LETTERS"],
        ["OpenAI", ""],
        ["OpenAI Model", "gpt-4o"],
        ["OpenAI API Key", "your-openai-api-key"],
        ["Anthropic", ""],
        ["Anthropic Model", "claude-3-5-sonnet-20240620"],
        ["Anthropic API Key", "your-anthropic-api-key"],
        ["Selected Provider", "OpenAI"],
      ];

      configRange.format.autofitColumns();
      configRange.format.fill.color = "#f0f0f0";
      configRange.getRow(0).format.font.bold = true;
      configRange.getRow(2).format.font.bold = true;
      configRange.getRow(5).format.font.bold = true;
      configRange.getRow(8).format.font.bold = true;

      const openAIapiKeyCell = sheet.getRange("B5");
      openAIapiKeyCell.numberFormat = [[';;;"**************"']];
      const anthropicApiKeyCell = sheet.getRange("B8");
      anthropicApiKeyCell.numberFormat = [[';;;"**************"']];

      const dropdownCell = sheet.getRange("B9");
      dropdownCell.dataValidation.clear();
      dropdownCell.dataValidation.rule = {
        list: {
          inCellDropDown: true,
          source: "OpenAI,Anthropic",
        },
      };

      const tableRange = sheet.getRange("D1:E2");
      tableRange.values = [
        ["Prompt", "Answer"],
        [
          "",
          '=IF($B$9="OpenAI", LLMExcel.PROMPT_STREAM(D2, $B$4, $B$5, $B$2, "openai"), LLMExcel.PROMPT_STREAM(D2, $B$6, $B$7, $B$2, "anthropic"))',
        ],
      ];

      const table = sheet.tables.add(tableRange, true);
      table.name = "PromptAnswerTable";

      table.getHeaderRowRange().format.font.bold = true;
      table.columns.getItem("Answer").getRange().format.autofitColumns();

      await context.sync();
    }).catch((error) => {
      console.error(error);
    });

    console.log("LLM setup with provider selection inserted successfully.");
  } catch (error) {
    console.error(error);
  }
}

Office.actions.associate("insertLLMSetup", insertLLMSetup);
