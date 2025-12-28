 import { enUS, th } from "date-fns/locale"
import { Language } from "./types"

export const languages: Language[] = [
  {
    code: "en",
    display_name: "English",
    ltr: true,
    date_locale: enUS,
  },
  {
    code: "th",
    display_name: "ไทย",
    ltr: true,
    date_locale: th,
  },
]
