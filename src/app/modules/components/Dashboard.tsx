import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './dashboard.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const recentItemsContainerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    if (recentItemsContainerRef.current) {
      recentItemsContainerRef.current.scrollLeft = 0;
    }
  }, []);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    example1: '',
    example2: '',
    example3: '',
    example4: '',
    example5: '',
    example6: '',
  });
  
  const menuItems = [
    { icon: 'fa-light fa-building', title: 'معدات', link: '#' },
    { icon: 'fa-light fa-microchip', title: 'تكنولوجيا', link: '#' },
    { icon: 'fa-light fa-book-open', title: 'التدريب', link: '#' },
    { icon: 'fa-light fa-users', title: 'موارد بشرية', link: '#' },
    { icon: 'fa-light fa-list-check', title: 'عقلية', link: '#' },
    { icon: 'fa-light fa-chart-pie', title: 'لوجستي', link: '#' },
    { icon: 'fa-light fa-chart-line', title: 'ميزانية', link: '#' },
    { icon: 'fa-light fa-phone', title: 'بنية تحتية', link: '#' },
    { icon: 'fa-light fa-arrow-right', title: 'عمليات', link: '#' },
    { icon: 'fa-light fa-newspaper', title: 'مقال جديد', link: '/article/new' },
];

  const recentItems = [
    {
      title: 'التكنولوجيا الحديثة في تعزيز',
      subtitle: 'الأمن الداخلي',
      image: '/media/logos/png/ellipse-132.png',
      author: 'سلاح الإشادة',
      date: '2025/07/22'
    },
    {
      title: 'التعاون المجتمعي كركيزة للأمن',
      subtitle: 'الداخلي المستدام',
      image: '/media/logos/png/ellipse-132.png',
      author: 'سلاح الإشادة',
      date: '2025/07/22'
    },
    {
      title: 'الأمن الداخلي من المنظور',
      subtitle: 'الأمني و العسكري',
      image: '/media/logos/png/ellipse-132.png',
      author: 'سلاح الإشادة',
      date: '2025/07/22'
    },
     {
      title: 'الأمن الداخلي من المنظور',
      subtitle: 'الأمني و العسكري',
      image: '/media/logos/png/ellipse-132.png',
      author: 'سلاح الإشادة',
      date: '2025/07/22'
    },
     {
      title: 'الأمن الداخلي من المنظور',
      subtitle: 'الأمني و العسكري',
      image: '/media/logos/png/ellipse-132.png',
      author: 'سلاح الإشادة',
      date: '2025/07/22'
    }
  ];

  return (
    <div className='dashboard-wrapper'>
      <div className='dashboard-container p-0'>
      {/* Header with logo */}
      <div className='py-5'>
        <div className='header-logo text-center mb-4'>
          <img src='/media/svg/logo/full-mod-logo.svg' alt='UAE MOD Logo' className='h-80px' />
        </div>
        <div className='search-filter-container'>
          <div className='row'>
             <div className='col-md-2' style={{textAlign:"left",paddingTop:"12px"}}>
            فلتر
            </div>
            <div className='col-md-8 p-0'>
              <div className='search-input-group'>
                <i className='fa-light fa-magnifying-glass search-icon'></i>
                <input 
                  type="text" 
                  placeholder="البحث" 
                  className='search-input' 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
           
           
            <div className='col-md-2'>
              <div 
                className={`filter-section d-flex align-items-center p-0 h-100 ${showFilter ? 'active' : ''}`}
                onClick={() => setShowFilter(!showFilter)}
              >
                <i className='fa-light fa-filter filter-icon'></i>
              </div>
            </div>
          </div>
          <div className={`filter-dropdown-container ${showFilter ? 'show' : ''}`}>
            <div className='filter-grid'>
              <div className='filter-item'>
                
                <select 
                  value={selectedFilters.example1}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, example1: e.target.value }))}
                >
                  <option value="">اختر...</option>
                  <option value="1">خيار 1</option>
                  <option value="2">خيار 2</option>
                </select>
              </div>
              <div className='filter-item'>
              
                <select
                  value={selectedFilters.example2}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, example2: e.target.value }))}
                >
                  <option value="">اختر...</option>
                  <option value="1">خيار 1</option>
                  <option value="2">خيار 2</option>
                </select>
              </div>
              <div className='filter-item'>
               
                <select
                  value={selectedFilters.example3}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, example3: e.target.value }))}
                >
                  <option value="">اختر...</option>
                  <option value="1">خيار 1</option>
                  <option value="2">خيار 2</option>
                </select>
              </div>
              <div className='filter-item'>
                
                <select
                  value={selectedFilters.example4}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, example4: e.target.value }))}
                >
                  <option value="">اختر...</option>
                  <option value="1">خيار 1</option>
                  <option value="2">خيار 2</option>
                </select>
              </div>
              <div className='filter-item'>
                 
                <select
                  value={selectedFilters.example5}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, example5: e.target.value }))}
                >
                  <option value="">اختر...</option>
                  <option value="1">خيار 1</option>
                  <option value="2">خيار 2</option>
                </select>
              </div>
              <div className='filter-item'>
                 
                <select
                  value={selectedFilters.example6}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, example6: e.target.value }))}
                >
                  <option value="">اختر...</option>
                  <option value="1">خيار 1</option>
                  <option value="2">خيار 2</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className='menu-grid-container'>
        <div className='menu-grid'>
          {menuItems
            .filter(item => 
              item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.icon.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((item, index) => (
            <div 
              key={index} 
              className='menu-item-card'
              onClick={() => item.link !== '#' && navigate(item.link)}
              style={{ cursor: item.link !== '#' ? 'pointer' : 'default' }}
            >
              <i className={`${item.icon} menu-item-icon`}></i>
              <h3 className='menu-item-title'>{item.title}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Items Section */}
      <div className='recent-items-container' style={{paddingLeft:"14%", paddingRight:"14%"}}>
        <div className='recent-items-header'>
          <h3 className='recent-items-title'>أضيف حديثاً</h3>
          <button className='btn-view-more'>اظهر المزيد</button>
        </div>

        <div 
            ref={recentItemsContainerRef}
            style={{
              display: 'flex',
              overflowX: 'auto',
              gap: '45px',
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch'
            }}>
          {recentItems.map((item, index) => (
            <div key={index} style={{
              flex: '0 0 auto',
            //   width: 'calc(33.333% - 14px)',
                width: '342px',
              height: '363px',
            }}>
              <div className='recent-item-card'>
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className='recent-item-image'
                />
                <div className='recent-item-overlay'>
                  <div className='recent-item-content'>
                    <h4 className='recent-item-title'>{item.title}</h4>
                    <p className='recent-item-subtitle'>{item.subtitle}</p>
                  </div>
                  <div className='recent-item-hover-content'>
                    <div className='recent-item-meta'>
                      <span className='recent-item-meta-label'>بواسطة:</span>
                      <span className='recent-item-meta-value'>{item.author}</span>
                    </div>
                    <div className='recent-item-meta'>
                      <span className='recent-item-meta-label'>السنة:</span>
                      <span className='recent-item-meta-value'>{item.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>

      {/* Footer */}
      <div className="dashboard-footer">
        <div className="footer-stats">
          <div className="stat-item">
            <i className="fa-light fa-expand"></i>
             <div className="stat-value">1200</div>
            <span >إحصائية ١</span>
           
          </div>
          <div className="stat-item">
            <i className="fa-light fa-book"></i>
             <div className="stat-value">+1200</div>
            <span>إحصائية ٢</span>
           
          </div>
          <div className="stat-item">
            <i className="fa-light fa-chart-simple"></i>
             <div className="stat-value">1200</div>
            <span>رمز عدد المستخدم</span>
           
          </div>
        </div>
        <div className="footer-copyright">
          جميع الحقوق محفوظة © وزارة الدفاع - دولة الإمارات العربية المتحدة.
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
