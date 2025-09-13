import React from 'react';
import ComponentShowcase from '../ComponentShowcase/ComponentShowcase';

/**
 * Demo page showing different ways to use the ComponentShowcase component
 * صفحة عرض توضح طرق مختلفة لاستخدام مكون ComponentShowcase
 */
const ComponentShowcaseDemo: React.FC = () => {
  return (
    <div className="container-fluid p-4">
      <div className="row">
        <div className="col-12">
          <h1 className="text-center mb-5">
            ComponentShowcase Demo | عرض توضيحي لمكون العرض
          </h1>
          
          {/* Demo 1: Full Featured Showcase */}
          <div className="mb-5">
            <h2 className="mb-3">Full Featured Showcase | العرض الكامل المميز</h2>
            <div className="border rounded p-3 bg-light">
              <ComponentShowcase 
                title="Complete Component Library | مكتبة المكونات الكاملة"
                showPageHeader={true}
                enableInteractivity={true}
              />
            </div>
          </div>

          {/* Demo 2: Minimal Showcase */}
          <div className="mb-5">
            <h2 className="mb-3">Minimal Showcase | العرض المبسط</h2>
            <div className="border rounded p-3">
              <ComponentShowcase 
                title="Basic Components | المكونات الأساسية"
                showPageHeader={false}
                enableInteractivity={false}
              />
            </div>
          </div>

          {/* Demo 3: Custom Title Only */}
          <div className="mb-5">
            <h2 className="mb-3">Custom Title Demo | عرض العنوان المخصص</h2>
            <div className="border rounded p-3 bg-info bg-opacity-10">
              <ComponentShowcase 
                title="مكتبة المكونات العربية | Arabic Component Library"
                showPageHeader={true}
                enableInteractivity={false}
              />
            </div>
          </div>

          {/* Demo 4: Default Settings */}
          <div className="mb-5">
            <h2 className="mb-3">Default Settings | الإعدادات الافتراضية</h2>
            <div className="border rounded p-3 bg-success bg-opacity-10">
              <ComponentShowcase />
            </div>
          </div>

          {/* Usage Examples */}
          <div className="mt-5">
            <h2 className="mb-3">Usage Examples | أمثلة الاستخدام</h2>
            <div className="row">
              <div className="col-md-6">
                <h4>Basic Usage</h4>
                <pre className="bg-dark text-light p-3 rounded">
{`<ComponentShowcase />`}
                </pre>
              </div>
              <div className="col-md-6">
                <h4>Custom Configuration</h4>
                <pre className="bg-dark text-light p-3 rounded">
{`<ComponentShowcase 
  title="My Components"
  showPageHeader={true}
  enableInteractivity={true}
/>`}
                </pre>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="mt-5">
            <h2 className="mb-3">Features | الميزات</h2>
            <div className="row">
              <div className="col-md-6">
                <h4>English Features</h4>
                <ul className="list-group">
                  <li className="list-group-item">✅ All Common Components</li>
                  <li className="list-group-item">✅ Interactive Elements</li>
                  <li className="list-group-item">✅ Responsive Design</li>
                  <li className="list-group-item">✅ TypeScript Support</li>
                  <li className="list-group-item">✅ Customizable Props</li>
                </ul>
              </div>
              <div className="col-md-6">
                <h4>الميزات العربية</h4>
                <ul className="list-group">
                  <li className="list-group-item">✅ جميع المكونات المشتركة</li>
                  <li className="list-group-item">✅ عناصر تفاعلية</li>
                  <li className="list-group-item">✅ تصميم متجاوب</li>
                  <li className="list-group-item">✅ دعم TypeScript</li>
                  <li className="list-group-item">✅ خصائص قابلة للتخصيص</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentShowcaseDemo;
