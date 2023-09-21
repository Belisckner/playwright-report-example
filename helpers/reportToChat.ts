import got from 'got';


// predefined variables gitlab
const CI_API_V4_URL = process.env.CI_API_V4_URL
const CI_PROJECT_ID = process.env.CI_PROJECT_ID;
const CI_PIPELINE_URL = process.env.CI_PIPELINE_URL;
const CI_PIPELINE_ID = process.env.CI_PIPELINE_ID;
const JOB_ID = process.env.CI_JOB_ID
const PAGES_URL = process.env.CI_PAGES_URL?.replace(/(?<=[a-z])\//, '/-/')
const NODE_NUMBER = Number(process.env.PARALLEL)
// specific variable in CI
const ROCKET_WEBHOOK = process.env.ROCKET_WEBHOOK;
const TOKEN_FOR_GET_GITLAB_REPORT = process.env.TOKEN;

interface IGitlabResponse {
  total_count: number;
  failed_count: number;
  skipped_count: number;
  test_suites: object;
}

class Report implements IReport {
  public total: number;
  public failed: number;
  public skipped: number;
  constructor(response: IGitlabResponse) {
    this.total = response.total_count;
    this.failed = response.failed_count;
    this.skipped = response.skipped_count;
  }
}

interface IReport {
  total: number;
  failed: number;
  skipped: number;
}

interface ISendRocketChat {
  reportUrl: string,
  htmlURL: string,
  report: IReport,
}




async function getGitlabReport(): Promise<IReport> {
  const headers = { 'PRIVATE-TOKEN': TOKEN_FOR_GET_GITLAB_REPORT };
  const url = `${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/pipelines/${CI_PIPELINE_ID}/test_report`;
  try {
    const responseJson: IGitlabResponse = await got.get(url, { headers: headers }).json();
    return new Report(responseJson);
  } catch (error) {
    throw new Error('Не удалось загрузить репорт с gitlab\n' + error);
  }
};


async function sendRocketChatMessage(param: ISendRocketChat): Promise<void> {
  const resultMsg = param.report.failed === 0 ? 'Успешно :white_check_mark:' : 'Найдены ошибки :sos:'

  const payload = {
    text:
      `Ссылка на [JUnit отчёт](${param.reportUrl}) на [HTML](${param.htmlURL})\n` +
      `${resultMsg}\n` +
      `\`\`\`\nTotal:   ${param.report.total}\n` +
      `Failed:  ${param.report.failed}\n` +
      `Skipped: ${param.report.skipped}\n\`\`\``
  };
  await got.post(ROCKET_WEBHOOK as string, { json: payload });
}

async function main() {
  const test_report = await getGitlabReport();
  try {
    await sendRocketChatMessage({
      reportUrl: `${CI_PIPELINE_URL}/test_report`,
      htmlURL: `${PAGES_URL}/-/jobs/${JOB_ID}/artifacts/playwright-report/index.html`,
      report: test_report,
    });
  } catch (error) {
    throw new Error('Не удалось отправить сообщение в Rocket.Chat\n' + error);
  }
}

main();
