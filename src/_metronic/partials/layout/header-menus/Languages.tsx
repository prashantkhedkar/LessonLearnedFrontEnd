/* eslint-disable jsx-a11y/anchor-is-valid */
import clsx from 'clsx'
import { FC } from 'react'
import { useLang, setLanguage } from '../../../i18n/Metronici18n'

const languages = [
  {
    lang: 'en',
    name: 'English',
  },
  {
    lang: 'ar',
    name: 'العربية',
  },
]

const Languages: FC = () => {
  const lang = useLang();
  const currentLanguage = languages.find((x) => x.lang === lang);

  return (
    <>
      {
        languages.map((l) => (
          <div
            className='menu-item px-3'
            key={l.lang}
            onClick={() => {
              setLanguage(l.lang)
            }}>
            <a
              href='#'
              className={clsx('menu-link d-flex px-5', { active: l.lang === currentLanguage?.lang })}
              style={
                {
                  direction: currentLanguage?.lang === 'ar' ? 'rtl' : 'ltr',
                  font: 'var(--text-medium-2, 500 14px/24px "Roboto-Regular", sans-serif)'
                }
              }>
              {/* <span className='symbol symbol-20px mx-4'>
                <img className='rounded-1' src={l.flag} alt='metronic' />
              </span> */}
              {l.name}
            </a>
          </div>
        ))}
    </>
  )
}

export { Languages }