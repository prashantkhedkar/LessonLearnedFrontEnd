import { useIntl } from 'react-intl'
import { MenuItem } from './MenuItem'
import { MenuInnerWithSub } from './MenuInnerWithSub'
import { useLocation } from 'react-router-dom';
import { useLang } from '../../../../i18n/Metronici18n';
// import {MegaMenu} from './MegaMenu'



// ADD MENU ITEMS AND SUB ITEMS THAT WILL APPEAR ON HEADER NAV BAR IF ENABLED
export function MenuInner() {
  const intl = useIntl();
  const location = useLocation();

  let breadcrumb = {
    currentPath: '',
    currentPage: ''
  }

  // Enable toggling of Breadcrumb based on selected language
  const lang = useLang();
  const locationObject = location.pathname.split('/').filter(crumb => crumb !== '');
  const locationObjectHeader = location.pathname.split('/').filter(crumb => crumb !== '');
  const locationObjectAr = (lang === 'ar') ? locationObject.reverse() : locationObject;

  locationObjectAr
    .map((crumb, index) => {
      crumb = crumb.replaceAll('-', ' ');
      const words = crumb.split(" ");

      for (let i = 0; i < words.length; i++) {
        words[i] = words[i][0].toUpperCase() + words[i].substr(1);
      }
      breadcrumb.currentPage = words.join(" ");

      return (
        breadcrumb.currentPage
      );
    });

  locationObjectAr
    .map((crumb, index) => {
      crumb = crumb.replaceAll('-', ' ');
      const words = crumb.split(" ");

      for (let i = 0; i < words.length; i++) {
        words[i] = words[i][0].toUpperCase() + words[i].substr(1);
      }
      crumb = words.join(" ");
      breadcrumb.currentPath += ` ${crumb} •`;

      return (
        breadcrumb.currentPath
      );
    });

  function GetSubHeader() {
    let text = "";
    const locationObjectHeader = location.pathname.split('/').filter(crumb => crumb !== '');
    locationObjectHeader.map((item) => (
      text = text + '.' + item.replace('-', '').toUpperCase().replace(' ', '')
    ));

    return ' • ' + intl.formatMessage({ id: 'MENU.HEADER' + text });
  };

  return (
    <>
      {/* {"locationObjectHeader " + JSON.stringify(locationObjectHeader)} */}
      <div className='navbar-header-breadcrumb-container' id="kt_pagetitle_breadcrumb">
        <div className={"navbar-header-breadcrumb-page"}>
          {intl.formatMessage({ id: 'MENU.HEADER.' + locationObjectHeader[0].replace('-', '').toUpperCase().replace(' ', '') })}
          {" "}
        </div>
        <div className={"navbar-header-breadcrumb-path pt-2"}  >
          <div>
            {intl.formatMessage({ id: 'MENU.HEADER.' + locationObjectHeader[0].replace('-', '').toUpperCase().replace(' ', '') })}
            {/* {breadcrumb.currentPath.slice(0, -1)} */} &nbsp;

            {locationObjectHeader.length > 1 && GetSubHeader()}
          </div>
        </div>
      </div>
      {/* <MenuItem title={intl.formatMessage({ id: 'MENU.DASHBOARD' })} to='/dashboard' /> */}

      {/* <MenuItem title={intl.formatMessage({ id: 'MENU.DASHBOARD' })} to='/dashboard' /> */}

      {/* <MenuItem title='Layout Builder' to='/builder' /> */}

      {/* <MenuInnerWithSub
        title='Crafted'
        to='/crafted'
        menuPlacement='bottom-start'
        menuTrigger='click'
      > */}
      {/* PAGES */}
      {/* <MenuInnerWithSub
          title='Pages'
          to='/crafted/pages'
          fontIcon='bi-archive'
          hasArrow={true}
          menuPlacement='right-start'
          menuTrigger={`{default:'click', lg: 'hover'}`}
        > */}
      {/* <MenuInnerWithSub
            title='Profile'
            to='/crafted/pages/profile'
            hasArrow={true}
            hasBullet={true}
            menuPlacement='right-start'
            menuTrigger={`{default:'click', lg: 'hover'}`}
          >
            <MenuItem to='/crafted/pages/profile/overview' title='Overview' hasBullet={true} />
            <MenuItem to='/crafted/pages/profile/projects' title='Projects' hasBullet={true} />
            <MenuItem to='/crafted/pages/profile/campaigns' title='Campaigns' hasBullet={true} />
            <MenuItem to='/crafted/pages/profile/documents' title='Documents' hasBullet={true} />
            <MenuItem
              to='/crafted/pages/profile/connections'
              title='Connections'
              hasBullet={true}
            />
          </MenuInnerWithSub> */}
      {/* <MenuInnerWithSub
            title='Wizards'
            to='/crafted/pages/wizards'
            hasArrow={true}
            hasBullet={true}
            menuPlacement='right-start'
            menuTrigger={`{default:'click', lg: 'hover'}`}
          >
            <MenuItem to='/crafted/pages/wizards/horizontal' title='Horizontal' hasBullet={true} />
            <MenuItem to='/crafted/pages/wizards/vertical' title='Vertical' hasBullet={true} />
          </MenuInnerWithSub> */}
      {/* </MenuInnerWithSub> */}

      {/* ACCOUNT */}
      {/* <MenuInnerWithSub
          title='Accounts'
          to='/crafted/accounts'
          fontIcon='bi-person'
          hasArrow={true}
          menuPlacement='right-start'
          menuTrigger={`{default:'click', lg: 'hover'}`}
        >
          <MenuItem to='/crafted/account/overview' title='Overview' hasBullet={true} />
          <MenuItem to='/crafted/account/settings' title='Settings' hasBullet={true} />
        </MenuInnerWithSub> */}

      {/* ERRORS */}
      {/* <MenuInnerWithSub
          title='Errors'
          to='/error'
          fontIcon='bi-sticky'
          hasArrow={true}
          menuPlacement='right-start'
          menuTrigger={`{default:'click', lg: 'hover'}`}
        >
          <MenuItem to='/error/404' title='Error 404' hasBullet={true} />
          <MenuItem to='/error/500' title='Error 500' hasBullet={true} />
        </MenuInnerWithSub> */}

      {/* Widgets */}
      {/* <MenuInnerWithSub
          title='Widgets'
          to='/crafted/widgets'
          fontIcon='bi-layers'
          hasArrow={true}
          menuPlacement='right-start'
          menuTrigger={`{default:'click', lg: 'hover'}`}
        >
          <MenuItem to='/crafted/widgets/lists' title='Lists' hasBullet={true} />
          <MenuItem to='/crafted/widgets/statistics' title='Statistics' hasBullet={true} />
          <MenuItem to='/crafted/widgets/charts' title='Charts' hasBullet={true} />
          <MenuItem to='/crafted/widgets/mixed' title='Mixed' hasBullet={true} />
          <MenuItem to='/crafted/widgets/tables' title='Tables' hasBullet={true} />
          <MenuItem to='/crafted/widgets/feeds' title='Feeds' hasBullet={true} />
        </MenuInnerWithSub> */}
      {/* </MenuInnerWithSub> */}

      {/* PAGES */}
      {/* <MenuInnerWithSub title='Apps' to='/apps' menuPlacement='bottom-start' menuTrigger='click'>
        <MenuInnerWithSub
          title='Chat'
          to='/apps/chat'
          icon='message-text-2'
          hasArrow={true}
          menuPlacement='right-start'
          menuTrigger={`{default:'click', lg: 'hover'}`}
        >
          <MenuItem to='/apps/chat/private-chat' title='Private Chat' hasBullet={true} />
          <MenuItem to='/apps/chat/group-chat' title='Group Chart' hasBullet={true} />
          <MenuItem to='/apps/chat/drawer-chat' title='Drawer Chart' hasBullet={true} />
        </MenuInnerWithSub>
        <MenuItem icon='abstract-28' to='/apps/user-management/users' title='User management' />
      </MenuInnerWithSub> */}

      {/* <MenuInnerWithSub
        isMega={true}
        title='Mega menu'
        to='/mega-menu'
        menuPlacement='bottom-start'
        menuTrigger='click'
      >
        <MegaMenu />
      </MenuInnerWithSub> */}
    </>
  )
}
