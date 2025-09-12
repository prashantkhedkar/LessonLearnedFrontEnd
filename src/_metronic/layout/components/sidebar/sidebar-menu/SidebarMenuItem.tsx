import { FC } from 'react'
import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router'
import { checkIsActive, KTIcon, WithChildren } from '../../../../helpers'
import { useLayout } from '../../../core'

type Props = {
  to: string
  title: string
  icon?: string
  fontIcon?: string
  hasBullet?: boolean
  isTarget?: boolean
}

const SidebarMenuItem: FC<Props & WithChildren> = ({
  children,
  to,
  title,
  icon,
  fontIcon,
  hasBullet = false,
  isTarget = false
}) => {
  const { pathname } = useLocation()
  const isActive = checkIsActive(pathname, to)

  const { config } = useLayout()
  const { app } = config

  function toAbsoluteUrl(arg0: string): JSX.IntrinsicAttributes & import("react").ClassAttributes<HTMLImageElement> & import("react").ImgHTMLAttributes<HTMLImageElement> {
    throw new Error('Function not implemented.')
  }

  return (
    <div className='menu-item'>
      {
        (isTarget == true ?
          <a className={clsx('menu-link without-sub', { active: isActive })} href={to} target='_blank'>
            {hasBullet && (
              <span className='menu-bullet'>
                <span className='bullet bullet-dot'></span>
              </span>
            )}
            {icon && app?.sidebar?.default?.menu?.iconType === 'svg' && (
              <span className='menu-icon' style={{ width: "1.3rem" }}>
                {' '}
                <KTIcon iconName={icon} className='fs-2' />
              </span>
            )}
            {fontIcon && app?.sidebar?.default?.menu?.iconType === 'font' && (
              <i className={clsx('bi fs-3', fontIcon)}></i>
            )}
            {icon && app?.sidebar?.default?.menu?.iconType === 'custom' && (
              <span className='menu-icon' style={{ width: "1.3rem" }}>
                {' '}
                {<img src={icon} className={`fs-2 ${isActive === true ? "menu_icon_selected" : ""}`} />}
              </span>
            )}
            <span className='menu-title'>{title}</span>
          </a>
          :
          <Link className={clsx('menu-link without-sub', { active: isActive })} to={to}>
            {hasBullet && (
              <span className='menu-bullet'>
                <span className='bullet bullet-dot'></span>
              </span>
            )}
            {/* {icon && app?.sidebar?.default?.menu?.iconType === 'svg' && (
              <span className='menu-icon' style={{ width: "1.3rem" }}>
                {' '}
                <KTIcon iconName={icon} className='fs-2' />
              </span>
            )} */}
            {/* {fontIcon && app?.sidebar?.default?.menu?.iconType === 'font' && (
              <i className={clsx('bi fs-3', fontIcon)}></i>
            )} */}
            {fontIcon && (
              <i className={`fs-2 ${fontIcon} ${isActive === true ? "menu_icon_selected" : "active-menu-icon"}`}></i>
            )}
            {/* {icon && app?.sidebar?.default?.menu?.iconType === 'custom' && (
              <span className='menu-icon' style={{ width: "1.3rem" }}>
                {' '}
                {<img src={icon} className={`fs-2 ${isActive === true ? "menu_icon_selected" : ""}`} />}
              </span>
            )} */}
            <span className='menu-title'>{title}</span>
          </Link>

        )
      }

      {children}
    </div>
  )
}

export { SidebarMenuItem }
