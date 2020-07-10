import ForgeUI, { render, Fragment, Text, Button, ButtonSet, useState, useProductContext } from "@forge/ui";
import api from "@forge/api";

const SUMMARY_API = 'https://api.meaningcloud.com/summarization-1.0';

const { SUMMARY_API_KEY, DEBUG_LOGGING } = process.env;

const OPTIONS = [
  ['One line summary', '1'],
  ['Two lines summary', '2'],
  ['Three lines summary', '3'],
  ['Four lines summary', '4'],
  ['Five lines summary', '5'],
];

const Panel = () => {
  const { platformContext: { issueKey } } = useProductContext();
  const [summarization, setSummarization] = useState(null);

  async function setLanguage(countryCode) {
    const issueResponse = await api.asApp().requestJira(`/rest/api/2/issue/${issueKey}?fields=summary,description`);
    await checkResponse('Jira API', issueResponse);
    const { summary, description } = (await issueResponse.json()).fields;
    const response = await api.fetch(`https://api.meaningcloud.com/summarization-1.0?key=961f84ad022230871e07261de9f70a28&sentences=${countryCode}&txt=${description}`);
    const json = await response.text();
    setSummarization({
      summary: summary,
      description: json
    });
  }
  
  // Render the UI
  return (
    <Fragment>
      <ButtonSet>
        {OPTIONS.map(([label, code]) =>
          <Button
            text={label}
            onClick={async () => { await setLanguage(code); }}
          />
        )}
      </ButtonSet>
      {summarization && (
        <Fragment>
          <Text content={`**SUMMARY**`} />
          <Text content={summarization.description} />
        </Fragment>
      )}
    </Fragment>
  );
};

async function checkResponse(apiName, response) {
  if (!response.ok) {
    const message = `Error from ${apiName}: ${response.status} ${await response.text()}`;
    console.error(message);
    throw new Error(message);
  } else if (DEBUG_LOGGING) {
    console.debug(`Response from ${apiName}: ${await response.text()}`);
  }
}

export const run = render(<Panel />);
