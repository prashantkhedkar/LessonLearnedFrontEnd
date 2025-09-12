import { FC } from 'react'
import { useLang } from './Metronici18n'
import { IntlProvider } from 'react-intl'
import '@formatjs/intl-relativetimeformat/polyfill'
import '@formatjs/intl-relativetimeformat/locale-data/en'
import '@formatjs/intl-relativetimeformat/locale-data/ar'

import enMessages from './messages/en.json'
import arMessages from './messages/ar.json'
import { WithChildren } from '../helpers'

const allMessages = {
  en: enMessages,
  ar: arMessages,
}

const I18nProvider: FC<WithChildren> = ({ children }) => {
  
  const locale = useLang()
  const messages = allMessages[locale]

  return (
    <IntlProvider locale={locale} messages={messages}>
      {children}
    </IntlProvider>
  )
}

export { I18nProvider }
