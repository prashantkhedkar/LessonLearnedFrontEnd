import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useIntl } from 'react-intl';
import { useLang } from '../../../_metronic/i18n/Metronici18n';
import { InfoLabels } from '../../modules/components/common/formsLabels/detailLabels';
import DropdownList from '../../modules/components/dropdown/DropdownList';
import PageHeader from '../../modules/components/common/PageHeader/ObservationDetailWidget';
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
  observationSubject?: string;
  discussion?: string;
  conclusion?: string;
  initialRecommendation?: string;
  observationType?: number | null;
  originatingType?: number | null;
  level?: number | null;
  combatFunction?: number | null;
  currentAssignment?: string;
  status: number;
  attachments?: File[];
}

const ObservationForm: React.FC<ObservationFormProps> = ({ onSubmit, initialValues, mode = 'add', formikRef }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [typeOptions, setTypeOptions] = useState<ILookup[]>([]);
  const [levelOptions, setLevelOptions] = useState<ILookup[]>([]);
  const [combatFunctionOptions, setCombatFunctionOptions] = useState<ILookup[]>([]);
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

      // Load Combat Function options
      dispatch(GetLookupValues({ lookupType: "Domain" }))
        .then(unwrapResult)
        .then((originalPromiseResult) => {
          if (originalPromiseResult.statusCode === 200) {
            const response: ILookup[] = originalPromiseResult.data;
            setCombatFunctionOptions(response);
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
    observationSubject: Yup.string()
      .required(intl.formatMessage({ id: 'VALIDATION.OBSERVATION.SUBJECT.REQUIRED' }))
      .max(256, intl.formatMessage({ id: 'VALIDATION.OBSERVATION.SUBJECT.MAX_LENGTH' })),
    discussion: Yup.string()
      .required(intl.formatMessage({ id: 'VALIDATION.DISCUSSION.REQUIRED' }))
      .max(50, intl.formatMessage({ id: 'VALIDATION.DISCUSSION.MAX_LENGTH' })),
    conclusion: Yup.string()
      .required(intl.formatMessage({ id: 'VALIDATION.CONCLUSION.REQUIRED' }))
      .max(50, intl.formatMessage({ id: 'VALIDATION.CONCLUSION.MAX_LENGTH' })),
    initialRecommendation: Yup.string()
      .required(intl.formatMessage({ id: 'VALIDATION.INITIAL.RECOMMENDATION.REQUIRED' }))
      .max(50, intl.formatMessage({ id: 'VALIDATION.INITIAL.RECOMMENDATION.MAX_LENGTH' })),
    currentAssignment: Yup.string()
      .max(128, intl.formatMessage({ id: 'VALIDATION.CURRENT.ASSIGNMENT.MAX_LENGTH' })),
    observationType: Yup.number()
      .nullable()
      .required(intl.formatMessage({ id: 'VALIDATION.OBSERVATION.TYPE.REQUIRED' }))
      .min(1, intl.formatMessage({ id: 'VALIDATION.OBSERVATION.TYPE.REQUIRED' })),
    level: Yup.number()
      .nullable()
      .required(intl.formatMessage({ id: 'VALIDATION.OBSERVATION.LEVEL.REQUIRED' }))
      .min(1, intl.formatMessage({ id: 'VALIDATION.OBSERVATION.LEVEL.REQUIRED' })),
    combatFunction: Yup.number()
      .nullable(),
  });

  const formik = useFormik({
    initialValues: initialValues || {
      observationTitle: '',
      observationSubject: '',
      discussion: '',
      conclusion: '',
      initialRecommendation: '',
      observationType: null,
      originatingType: null,
      level: null,
      combatFunction: null,
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
        debugger
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
      {JSON.stringify(formik.values)}
      <div className="row">
        <div className="col-12 mb-4">
          <div className="row">
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
          <div className="row">
            <div className="col-md-2">
              <InfoLabels
                style={{}}
                text={intl.formatMessage({ id: "LABEL.SUBJECT" })}
                isRequired={false}
              />
            </div>
            <div className="col-md-10">
              <input
                type="text"
                autoComplete='off'
                className="form-control form-control-solid active input5 lbl-txt-medium-2"
                placeholder={intl.formatMessage({
                  id: "PLACEHOLDER.SUBJECT",
                })}
                {...formik.getFieldProps('observationSubject')}
                dir={lang === "ar" ? "rtl" : "ltr"}
              />
              {formik.touched.observationSubject && formik.errors.observationSubject && (
                <div className="error">{formik.errors.observationSubject}</div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 mb-4">
          <div className="row">
            
            <div className="col-md-2">
              <InfoLabels
                style={{}}
                text={intl.formatMessage({ id: "LABEL.OBSERVATION.TYPE" })}
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
                text={intl.formatMessage({ id: "LABEL.OBSERVATION.LEVEL" })}
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
        {/* <div className="col-12 mb-4">
          <div className="row">
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
        </div> */}
        <div className="col-12 mb-4">
          <div className="row">
          <div className="col-md-2">
              <InfoLabels
                style={{}}
                text={intl.formatMessage({ id: "LABEL.COMBOT_FUNCTION" })}
                isRequired={false}
              />
            </div>
            <div className="col-md-10">
              <DropdownList
                dataKey="lookupId"
                dataValue={lang === "ar" ? "lookupNameAr" : "lookupName"}
                defaultText={intl.formatMessage({ id: "PLACEHOLDER.SELECT.COMBOT_FUNCTION" })}
                value={formik.values.combatFunction}
                data={combatFunctionOptions}
                setSelectedValue={(value) => formik.setFieldValue('combatFunction', value)}
              />
              {formik.touched.combatFunction && formik.errors.combatFunction && (
                <div className="error">{formik.errors.combatFunction}</div>
              )}
            </div>

          </div>
        </div>
      </div>
    </form>
  );
};

export default ObservationForm;
