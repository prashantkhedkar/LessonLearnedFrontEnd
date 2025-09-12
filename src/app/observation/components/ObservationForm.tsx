import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useIntl } from 'react-intl';
import { useLang } from '../../../_metronic/i18n/Metronici18n';
import { InfoLabels } from '../../modules/components/common/formsLabels/detailLabels';
import DropdownList from '../../modules/components/dropdown/DropdownList';
import PageHeader from '../../modules/components/common/PageHeader/PageHeader';
import ContentSection from '../../modules/components/common/ContentSection/ContentSection';
import { BtnLabeltxtMedium2, BtnLabelCanceltxtMedium2 } from '../../modules/components/common/formsLabels/detailLabels';
import { writeToBrowserConsole } from '../../modules/utils/common';
import { unwrapResult } from '@reduxjs/toolkit';
import { ILookup } from '../../models/global/globalGeneric';
import { GetLookupValues } from '../../modules/services/adminSlice';
import { useAppDispatch } from '../../../store';
import { useAuth } from '../../modules/auth';

interface ObservationFormProps {
  onSubmit: (values: ObservationFormData) => void;
  initialValues?: ObservationFormData;
  mode?: 'add' | 'edit';
  formikRef?: React.MutableRefObject<any>;
}

export interface ObservationFormData {
  observationTitle: string;
  discussion?: string;
  conclusion?: string;
  initialRecommendation?: string;
  observationType?: number | null;
  originatingType?: number | null;
  level?: number | null;
  currentAssignment?: string;
  status: number;
  attachments?: File[];
}

const ObservationForm: React.FC<ObservationFormProps> = ({ onSubmit, initialValues, mode = 'add', formikRef }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [typeOptions, setTypeOptions] = useState<ILookup[]>([]);
  const [levelOptions, setLevelOptions] = useState<ILookup[]>([]);
  const intl = useIntl();
  const lang = useLang();
  const dispatch = useAppDispatch();
  const { auth } = useAuth();

  // Debug logging to verify props
  console.log('🔧 ObservationForm initialized with:', { 
    hasOnSubmit: typeof onSubmit === 'function',
    mode,
    hasInitialValues: !!initialValues 
  });

  useEffect(() => {
        auth && console.log("Current User in ObservationForm: ", auth);
      // Load Observation Types
      dispatch(GetLookupValues({ lookupType: "ObservationType" }))
        .then(unwrapResult)
        .then((originalPromiseResult) => {
          if (originalPromiseResult.statusCode === 200) {
            const response: ILookup[] = originalPromiseResult.data;
            setTypeOptions(response);
          }
        })
        .catch((rejectedValueOrSerializedError) => {
          writeToBrowserConsole(rejectedValueOrSerializedError);
        });

      // Load Observation Level options
      dispatch(GetLookupValues({ lookupType: "Level" }))
        .then(unwrapResult)
        .then((originalPromiseResult) => {
          if (originalPromiseResult.statusCode === 200) {
            const response: ILookup[] = originalPromiseResult.data;
            setLevelOptions(response);
          }
        })
        .catch((rejectedValueOrSerializedError) => {
          writeToBrowserConsole(rejectedValueOrSerializedError);
        });
    
  }, [dispatch]);


  const validationSchema = Yup.object({
    observationTitle: Yup.string()
      .required(intl.formatMessage({ id: 'VALIDATION.OBSERVATION.TITLE.REQUIRED' }))
      .max(256, intl.formatMessage({ id: 'VALIDATION.OBSERVATION.TITLE.MAX_LENGTH' })),
    discussion: Yup.string()
      .required(intl.formatMessage({ id: 'VALIDATION.DISCUSSION.REQUIRED' }))
      .max(50, 'Discussion must be less than 50 characters'),
    conclusion: Yup.string()
      .required(intl.formatMessage({ id: 'VALIDATION.CONCLUSION.REQUIRED' }))
      .max(50, 'Conclusion must be less than 50 characters'),
    initialRecommendation: Yup.string()
      .required(intl.formatMessage({ id: 'VALIDATION.INITIAL.RECOMMENDATION.REQUIRED' }))
      .max(50, 'Initial recommendation must be less than 50 characters'),
    currentAssignment: Yup.string()
      .max(128, 'Current assignment must be less than 128 characters'),
    observationType: Yup.number()
      .nullable()
      .required('Please select an observation type')
      .min(1, 'Please select an observation type'),
    level: Yup.number()
      .nullable()
      .required('Please select a level')
      .min(1, 'Please select a level'),
  });

  const formik = useFormik({
    initialValues: initialValues || {
      observationTitle: '',
      discussion: '',
      conclusion: '',
      initialRecommendation: '',
      observationType: null,
      originatingType: null,
      level: null,
      currentAssignment: '',
      status: 0,
      attachments: [],
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      console.log('📋 Formik onSubmit called with values:', values);
      setIsLoading(true);
      try {
        console.log('🔄 Calling parent onSubmit handler...');
        await onSubmit(values);
        console.log('✅ Parent onSubmit completed successfully');
      } catch (error) {
        console.error('❌ Error in parent onSubmit:', error);
      } finally {
        setIsLoading(false);
        console.log('🏁 Form submission completed');
      }
    },
  });

  // Expose formik instance to parent component
  useEffect(() => {
    if (formikRef) {
      formikRef.current = formik;
      console.log('🔗 Formik ref set:', formikRef.current);
    }
  }, [formikRef, formik]);

  return (
    <form onSubmit={formik.handleSubmit} className="article-form rtl-form">
      <div className="row">
        <div className="col-12 mb-4">
          <div className="row align-items-center">
            <div className="col-md-2">
              <InfoLabels
                style={{}}
                text={intl.formatMessage({ id: "LABEL.OBSERVATION.TITLE" })}
                isRequired={true}
              />
            </div>
            <div className="col-md-10">
              <input
                type="text"
                autoComplete='off'
                className="form-control form-control-solid active input5 lbl-txt-medium-2"
                placeholder={intl.formatMessage({
                  id: "PLACEHOLDER.OBSERVATION.TITLE",
                })}
                {...formik.getFieldProps('observationTitle')}
                dir={lang === "ar" ? "rtl" : "ltr"}
              />
              {formik.touched.observationTitle && formik.errors.observationTitle && (
                <div className="error">{formik.errors.observationTitle}</div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 mb-4">
          <div className="row align-items-center">
            <div className="col-md-2">
              <InfoLabels
                style={{}}
                text={intl.formatMessage({ id: "LABEL.TYPE" })}
                isRequired={true}
              />
            </div>
            <div className="col-md-4">
              <DropdownList
                dataKey="lookupId"
                dataValue={lang === "ar" ? "lookupNameAr" : "lookupName"}
                defaultText={intl.formatMessage({ id: "PLACEHOLDER.SELECT.TYPE" })}
                value={formik.values.observationType}
                data={typeOptions}
                setSelectedValue={(value) => formik.setFieldValue('observationType', value)}
              />
              {formik.touched.observationType && formik.errors.observationType && (
                <div className="error">{formik.errors.observationType}</div>
              )}
            </div>
            <div className="col-md-2">
              <InfoLabels
                style={{}}
                text={intl.formatMessage({ id: "LABEL.LEVEL" })}
                isRequired={true}
              />
            </div>
            <div className="col-md-4">
              <DropdownList
                dataKey="lookupId"
                dataValue={lang === "ar" ? "lookupNameAr" : "lookupName"}
                defaultText={intl.formatMessage({ id: "PLACEHOLDER.SELECT.LEVEL" })}
                value={formik.values.level}
                data={levelOptions}
                setSelectedValue={(value) => formik.setFieldValue('level', value)}
              />
              {formik.touched.level && formik.errors.level && (
                <div className="error">{formik.errors.level}</div>
              )}
            </div>
          </div>
        </div>  

        <div className="col-12 mb-4">
          <div className="row">
            <div className="col-md-2">
              <InfoLabels
                style={{}}
                text={intl.formatMessage({ id: "LABEL.DISCUSSION" })}
                isRequired={true}
              />
            </div>
            <div className="col-md-10">
              <textarea
                className="form-control"
                placeholder={intl.formatMessage({
                  id: "PLACEHOLDER.DISCUSSION",
                })}
                {...formik.getFieldProps('discussion')}
                rows={4}
                dir={lang === "ar" ? "rtl" : "ltr"}
              />
              {formik.touched.discussion && formik.errors.discussion && (
                <div className="error">{formik.errors.discussion}</div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 mb-4">
          <div className="row">
            <div className="col-md-2">
              <InfoLabels
                style={{}}
                text={intl.formatMessage({ id: "LABEL.CONCLUSION" })}
                isRequired={true}
              />
            </div>
            <div className="col-md-10">
              <textarea
                className="form-control"
                placeholder={intl.formatMessage({
                  id: "PLACEHOLDER.CONCLUSION",
                })}
                {...formik.getFieldProps('conclusion')}
                rows={4}
                dir={lang === "ar" ? "rtl" : "ltr"}
              />
              {formik.touched.conclusion && formik.errors.conclusion && (
                <div className="error">{formik.errors.conclusion}</div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 mb-4">
          <div className="row">
            <div className="col-md-2">
              <InfoLabels
                style={{}}
                text={intl.formatMessage({ id: "LABEL.INITIAL.RECOMMENDATION" })}
                isRequired={true}
              />
            </div>
            <div className="col-md-10">
              <textarea
                className="form-control"
                placeholder={intl.formatMessage({
                  id: "PLACEHOLDER.INITIAL.RECOMMENDATION",
                })}
                {...formik.getFieldProps('initialRecommendation')}
                rows={4}
                dir={lang === "ar" ? "rtl" : "ltr"}
              />
              {formik.touched.initialRecommendation && formik.errors.initialRecommendation && (
                <div className="error">{formik.errors.initialRecommendation}</div>
              )}
            </div>
          </div>
        </div>
        <div className="col-12 mb-4">
          <div className="row align-items-center">
            <div className="col-md-2">
              <InfoLabels
                style={{}}
                text={intl.formatMessage({ id: "LABEL.CURRENT.ASSIGNMENT" })}
                isRequired={false}
              />
            </div>
            <div className="col-md-4">
              <input
                type="text"
                className="form-control form-control-solid active input5 lbl-txt-medium-2"
                placeholder={intl.formatMessage({
                  id: "PLACEHOLDER.CURRENT.ASSIGNMENT",
                })}
                {...formik.getFieldProps('currentAssignment')}
                dir={lang === "ar" ? "rtl" : "ltr"}
              />
              {formik.touched.currentAssignment && formik.errors.currentAssignment && (
                <div className="error">{formik.errors.currentAssignment}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ObservationForm;
