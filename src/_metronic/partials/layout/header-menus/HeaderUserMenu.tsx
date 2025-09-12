/* eslint-disable jsx-a11y/anchor-is-valid */
import { FC } from 'react'
import { Languages } from './Languages'

// ADD ITEMS THAT WILL APPEAR AS MENU FOR A COMPONENET ON THE HEADER SECTION WHEN CLICKED...
const HeaderUserMenu: FC = () => {
  return (
    <div
      className='menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-150px'
      data-kt-menu='true'>
      <Languages />
    </div>
  )
}

export { HeaderUserMenu }
