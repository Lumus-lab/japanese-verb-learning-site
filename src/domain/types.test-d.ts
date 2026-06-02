import type { VerbFormValue } from "./types";

const standardForm: VerbFormValue = {
  surface: "書く",
  reading: "かく",
  status: "standard",
};

const notApplicableForm: VerbFormValue = {
  surface: null,
  reading: null,
  status: "not-applicable",
};

// @ts-expect-error Standard forms require a surface and reading.
const standardWithoutSurface: VerbFormValue = {
  surface: null,
  reading: null,
  status: "standard",
};

// @ts-expect-error Not-applicable forms cannot provide a surface or reading.
const notApplicableWithSurface: VerbFormValue = {
  surface: "書く",
  reading: "かく",
  status: "not-applicable",
};

void standardForm;
void notApplicableForm;
void standardWithoutSurface;
void notApplicableWithSurface;
