/*
  Copyright (c) Microsoft Corporation.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import * as React from 'react';
import type { TestCase, TestFile } from './types';
import './colors.css';
import './common.css';
import { Filter } from './filter';
import { HeaderView } from './headerView';
import { Route } from './links';
import type { LoadedReport } from './loadedReport';
import './reportView.css';
import type { Metainfo } from './metadataView';
import { MetadataView } from './metadataView';
import { TestCaseView } from './testCaseView';
import { TestFilesView } from './testFilesView';

declare global {
  interface Window {
    playwrightReportBase64?: string;
  }
}

// These are extracted to preserve the function identity between renders to avoid re-triggering effects.
const testFilesRoutePredicate = (params: URLSearchParams) => !params.has('testId');
const testCaseRoutePredicate = (params: URLSearchParams) => params.has('testId');

export const ReportView: React.FC<{
  report: LoadedReport | undefined,
}> = ({ report }) => {
  const searchParams = new URLSearchParams(window.location.hash.slice(1));
  const [expandedFiles, setExpandedFiles] = React.useState<Map<string, boolean>>(new Map());
  const [filterText, setFilterText] = React.useState(searchParams.get('q') || '');

  const filter = React.useMemo(() => Filter.parse(filterText), [filterText]);

  return <div className='htmlreport vbox px-4 pb-4'>
    <main>
      {report?.json() && <HeaderView stats={report.json().stats} filterText={filterText} setFilterText={setFilterText} projectNames={report.json().projectNames}></HeaderView>}
      {report?.json().metadata && <MetadataView {...report?.json().metadata as Metainfo} />}
      <Route predicate={testFilesRoutePredicate}>
        <TestFilesView report={report?.json()} filter={filter} expandedFiles={expandedFiles} setExpandedFiles={setExpandedFiles}></TestFilesView>
      </Route>
      <Route predicate={testCaseRoutePredicate}>
        {!!report && <TestCaseViewLoader report={report}></TestCaseViewLoader>}
      </Route>
    </main>
  </div>;
};

const TestCaseViewLoader: React.FC<{
  report: LoadedReport,
}> = ({ report }) => {
  const searchParams = new URLSearchParams(window.location.hash.slice(1));
  const [test, setTest] = React.useState<TestCase | undefined>();
  const testId = searchParams.get('testId');
  const anchor = (searchParams.get('anchor') || '') as 'video' | 'diff' | '';
  const run = +(searchParams.get('run') || '0');
  React.useEffect(() => {
    (async () => {
      if (!testId || testId === test?.testId)
        return;
      const fileId = testId.split('-')[0];
      if (!fileId)
        return;
      const file = await report.entry(`${fileId}.json`) as TestFile;
      for (const t of file.tests) {
        if (t.testId === testId) {
          setTest(t);
          break;
        }
      }
    })();
  }, [test, report, testId]);
  return <TestCaseView projectNames={report.json().projectNames} test={test} anchor={anchor} run={run}></TestCaseView>;
};
