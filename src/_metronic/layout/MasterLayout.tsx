import { useEffect, useState } from "react"
import { useLocation, Outlet } from "react-router-dom"
import { reInitMenu, toAbsoluteUrl } from "../helpers"
import { Content } from "./components/content"
import { FooterWrapper } from "./components/footer"
import { HeaderWrapper } from "./components/header"
import { ScrollTop } from "./components/scroll-top"
import { Sidebar } from "./components/sidebar"
import { PageDataProvider } from "./core"

import { useIntl } from "react-intl"


const MasterLayout = () => {
  const location = useLocation()
  useEffect(() => {
    reInitMenu()
  }, [location.key])
  const [showModal, setShowModal] = useState(false);
  const intl = useIntl();

  return (
    <div className="master-layout-old">
      <PageDataProvider>
        <div className='d-flex flex-column flex-root app-root' id='kt_app_root'>
          <div className='app-page flex-column flex-column-fluid' id='kt_app_page'>
            <HeaderWrapper />
            <div className='app-wrapper flex-column flex-row-fluid' id='kt_app_wrapper'>
              <Sidebar />
              <div className='app-main flex-column flex-row-fluid' id='kt_app_main'>
                <div className='d-flex flex-column flex-column-fluid'>
                  {/* <ToolbarWrapper /> */}
                  <Content>
                    <Outlet />
                  </Content>
                </div>
                <FooterWrapper />
              </div>
            </div>
          </div>
        </div>
        <ScrollTop />
      </PageDataProvider>
    </div>
  )
}

export { MasterLayout }
