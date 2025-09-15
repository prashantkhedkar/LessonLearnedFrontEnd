import React from 'react';
import './ComponentShowcase.css';

// Import all common components
import PageHeader from '../common/PageHeader/PageHeader';
import CardHeaderLabel from '../common/CardHeaderLabel/cardHeaderLabel';
import CardHeaderSubLabel from '../common/CardHeaderLabel/cardHeaderSubLabel';
import ContentSection from '../common/ContentSection/ContentSection';
import AuditField from '../common/auditField/AuditField';
import { CreateButton } from '../common/buttons/CreateButton';
import { 
  DetailLabels, 
  InfoLabels, 
  HeaderLabels, 
  LabelTitleMedium1,
  LabelSemibold2,
  LabelSemibold4,
  LabelSemibold6,
  Labelregular2
} from '../common/formsLabels/detailLabels';
import { ModSpecificSvg, FileTypeSvg, ColoredFileTypeSvg } from '../common/image/ModSpecificSvg';
import { FolderWhite, FolderBlack } from '../common/image/folder-image';
import { LabelCategory, LabelCategoryActive, GlobalLabel } from '../common/label/LabelCategory';

interface ComponentShowcaseProps {
  title?: string;
  showPageHeader?: boolean;
  enableInteractivity?: boolean;
}

const ComponentShowcase: React.FC<ComponentShowcaseProps> = ({ 
  title = "Component Showcase | عرض المكونات",
  showPageHeader = true,
  enableInteractivity = true
}) => {
  
  // Sample data and handlers for demonstration
  const handleCreateClick = () => {
    if (enableInteractivity) {
      console.log('Create button clicked');
      alert('Create button functionality demonstrated! | تم عرض وظيفة زر الإنشاء!');
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (enableInteractivity) {
      console.log('Input changed:', event.target.value);
    }
  };

  return (
    <div className="component-showcase-container">
      {/* Page Header Component */}
      {showPageHeader && (
        <div className="mb-4">
          <PageHeader title={title} />
        </div>
      )}
      
      {/* Section 1: Header and Title Components */}
      <div className="card mb-4">
        <div className="card-header">
          <CardHeaderLabel text="Header Components | مكونات الرأس" />
          <CardHeaderSubLabel 
            text="demonstrations | عروض توضيحية" 
            numericVal="4" 
            style={{ marginLeft: '10px' }} 
          />
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <HeaderLabels text="Main Header Label | تسمية الرأس الرئيسية" isI18nKey={false} />
              </div>
              <div className="mb-3">
                <LabelTitleMedium1 text="Medium Title Label | تسمية العنوان المتوسط" isI18nKey={false} />
              </div>
              <div className="mb-3">
                <LabelSemibold2 text="Semibold Label 2 | تسمية سميكة ٢" isI18nKey={false} />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <LabelSemibold4 text="Semibold Label 4 | تسمية سميكة ٤" isI18nKey={false} />
              </div>
              <div className="mb-3">
                <LabelSemibold6 text="Semibold Label 6 | تسمية سميكة ٦" isI18nKey={false} />
              </div>
              <div className="mb-3">
                <Labelregular2 text="Regular Label | تسمية عادية" isI18nKey={false} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Form and Detail Labels */}
      <div className="card mb-4">
        <div className="card-header">
          <CardHeaderLabel text="Form Labels | تسميات النماذج" />
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <DetailLabels text="Required Field | حقل مطلوب" isRequired={true} isI18nKey={false} />
              <input 
                type="text" 
                className="form-control mt-1" 
                placeholder="أدخل القيمة..."
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-4">
              <DetailLabels text="Optional Field | حقل اختياري" isRequired={false} isI18nKey={false} />
              <input 
                type="text" 
                className="form-control mt-1" 
                placeholder="أدخل القيمة..."
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-4">
              <InfoLabels text="Information Field | حقل المعلومات" isI18nKey={false} />
              <input 
                type="text" 
                className="form-control mt-1" 
                placeholder="معلومات..."
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Category and Global Labels */}
      <div className="card mb-4">
        <div className="card-header">
          <CardHeaderLabel text="Category Labels | تسميات الفئات" />
        </div>
        <div className="card-body">
          <div className="d-flex gap-3 mb-3 flex-wrap">
            <LabelCategory value="Standard Category | فئة قياسية" />
            <LabelCategoryActive value="Active Category | فئة نشطة" />
          </div>
          <div className="mb-2">
            <GlobalLabel 
              value="Global Label with <em>emphasis</em> and <strong>bold</strong> text | تسمية عامة مع نص <em>مميز</em> و <strong>عريض</strong>" 
              color="#2563eb" 
              fitContent={true}
            />
          </div>
          <div>
            <GlobalLabel 
              value="Required global label | تسمية عامة مطلوبة" 
              color="#dc2626" 
              required={true}
              fitContent={true}
            />
          </div>
        </div>
      </div>

      {/* Section 4: Content Section */}
      <div className="card mb-4">
        <div className="card-header">
          <CardHeaderLabel text="Content Components | مكونات المحتوى" />
        </div>
        <div className="card-body">
          <ContentSection 
            title="Sample Content Section | قسم محتوى عينة"
            content="This demonstrates the ContentSection component which displays structured information with a title and content body. هذا يوضح مكون قسم المحتوى الذي يعرض المعلومات المنظمة مع العنوان ونص المحتوى. It's useful for showing formatted data in a consistent layout. إنه مفيد لعرض البيانات المنسقة في تخطيط متسق."
          />
        </div>
      </div>

      {/* Section 5: Icons and Images */}
      <div className="card mb-4">
        <div className="card-header">
          <CardHeaderLabel text="Icons and Images | الأيقونات والصور" />
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h6>Module Specific Icons | أيقونات خاصة بالوحدة</h6>
              <div className="d-flex align-items-center gap-3 mb-3">
                <ModSpecificSvg name="icon-stroke-plus" myClass="svg-icon" />
                <span>Plus Icon | أيقونة الإضافة</span>
              </div>
              <div className="d-flex align-items-center gap-3 mb-3">
                <ModSpecificSvg name="icon-stroke-edit" myClass="svg-icon" />
                <span>Edit Icon | أيقونة التحرير</span>
              </div>
            </div>
            <div className="col-md-6">
              <h6>Folder Icons | أيقونات المجلدات</h6>
              <div className="d-flex align-items-center gap-3 mb-3">
                <FolderWhite />
                <FolderBlack />
                <span>White and Black Folders | مجلدات بيضاء وسوداء</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 6: Action Components */}
      <div className="card mb-4">
        <div className="card-header">
          <CardHeaderLabel text="Action Components | مكونات الإجراءات" />
        </div>
        <div className="card-body">
          <div className="mb-3">
            <CreateButton 
              url="/create"
              createOnClick={handleCreateClick}
              text="Create New Item | إنشاء عنصر جديد"
            />
          </div>
          <div>
            <AuditField 
              createdDate="٢٠٢٤-٠١-١٥ ١٠:٣٠:٠٠"
              updatedDate="٢٠٢٤-٠١-٢٠ ١٤:٤٥:٠٠"
            />
          </div>
          
          {/* Arabic Text Demonstration */}
          <div className="mt-4 p-3 bg-light rounded">
            <h6>Arabic Text Examples | أمثلة على النصوص العربية</h6>
            <div className="mb-2">
              <InfoLabels text="مرحباً بكم في نظام إدارة الدروس المستفادة" isI18nKey={false} />
            </div>
            <div className="mb-2">
              <DetailLabels text="هذا النظام يدعم اللغة العربية بشكل كامل" isI18nKey={false} />
            </div>
            <div className="mb-2">
              <LabelSemibold4 text="يمكن عرض المحتوى باللغتين العربية والإنجليزية" isI18nKey={false} />
            </div>
            <div>
              <GlobalLabel 
                value="النظام يدعم الكتابة من <strong>اليمين إلى اليسار</strong> والتنسيق المناسب للنصوص العربية" 
                color="#059669" 
                fitContent={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 7: Interactive Demo */}
      {enableInteractivity && (
        <div className="card">
          <div className="card-header">
            <CardHeaderLabel text="Interactive Demo | عرض تفاعلي" />
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <DetailLabels text="Test Input | إدخال التجربة" isRequired={false} isI18nKey={false} />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Type here to test... | اكتب هنا للاختبار..."
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-6">
                <DetailLabels text="Select Option | اختر الخيار" isRequired={false} isI18nKey={false} />
                <select className="form-control" onChange={(e) => handleInputChange(e as any)}>
                  <option value="">Select... | اختر...</option>
                  <option value="option1">Option 1 | الخيار ١</option>
                  <option value="option2">Option 2 | الخيار ٢</option>
                  <option value="option3">Option 3 | الخيار ٣</option>
                </select>
              </div>
            </div>
            <div className="mt-3">
              <InfoLabels text="All form interactions are logged to console | جميع تفاعلات النموذج يتم تسجيلها في وحدة التحكم" isI18nKey={false} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentShowcase;
