import { Box, Step, StepIconProps, StepLabel, Stepper, Button, Stack, Typography, StepConnector, styled } from "@mui/material"; 
import { useState, useRef } from "react";
import { WorkflowStepModel } from "../../models/global/serviceWorkflow";
import ObservationForm, { ObservationFormData } from "./ObservationForm";
import { ArticleCreateUpdateModel } from "../models/observationModel";
import { toast } from 'react-toastify';
import { useIntl } from 'react-intl'; 
import './ObservationSteppers.css';
import { BtnLabeltxtMedium2 } from "../../modules/components/common/formsLabels/detailLabels";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Recommendation from "./Recommendation";
import { useAppDispatch, useAppSelector } from "../../../store";
import { createObservation } from "../../modules/services/observationSlice";

// Custom Connector Component
const CustomConnector = styled(StepConnector)(({ theme }) => ({
  '&.MuiStepConnector-alternativeLabel': {
    top: 22,
  },
  '&.MuiStepConnector-active .MuiStepConnector-line': {
    borderColor: '#B7945A',
  },
  '&.MuiStepConnector-completed .MuiStepConnector-line': {
    borderColor: '#B7945A',
  },
  '& .MuiStepConnector-line': {
    borderColor: '#B7945A',
    borderTopWidth: 2,
    borderRadius: 1,
  },
}));

export const ObservationSteppers = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.observations);
  const formikRef = useRef<any>(null); // Reference to formik instance
  const [createdObservationId, setCreatedObservationId] = useState<string | number | null>(null); // Store created observation ID
  const [createdObservation, setCreatedObservation] = useState<any>(null); // Store the complete created observation
  
  // Default steps - no props needed
  const steps: WorkflowStepModel[] = [
    {
      stepId: 1,
      stepOrder: 1,
      stepName: "Observation",
      fromEntityId: 1,
      currentStatusId: 1,
    },
    {
      stepId: 2,
      stepOrder: 2,
      stepName: "Recommendation",
      fromEntityId: 2,
      currentStatusId: 2,
    },
    {
      stepId: 3,
      stepOrder: 3,
      stepName: "Attachments",
      fromEntityId: 3,
      currentStatusId: 3,
    },
  ];

  const [currentStepId, setCurrentStepId] = useState<number>(1); // Start with first step
  const [activeStep, setActiveStep] = useState<number>(0); // MUI Stepper is 0-indexed
  const [isActive, setIsActive] = useState<boolean>(false);

  // Common function to convert form values to API model
  const convertToAPIModel = (values: ObservationFormData | any, isDraft: boolean = false): ArticleCreateUpdateModel => {
    return {
      observationTitle: values.observationTitle || '',
      discussion: values.discussion || '',
      conclusion: values.conclusion || '',
      initialRecommendation: values.initialRecommendation || '',
      observationType: values.observationType || undefined,
      originatingType: values.originatingType || undefined,
      level: values.level || undefined,
      currentAssignment: values.currentAssignment || '',
      status: isDraft ? 12 : (values.status || 1), // 12 for draft, otherwise use form status or default to 1
    };
  };

  // Common function to handle API call for creating observation
  const createObservationAPI = async (data: ArticleCreateUpdateModel, submissionStatus: string, isDraft: boolean = false) => {
    try {
      console.log('⏳ Saving observation to API...');
      
      // Call the Redux action to create observation
      const result = await dispatch(createObservation({ 
        observationData: data,
        submissionStatus
      }));
      
      if (createObservation.fulfilled.match(result)) {
        const response = result.payload;
        
        if (response?.statusCode === 200 && response.data) {
          const newArticleId = response.data;
          
          // Save the complete response and ID in states
          setCreatedObservation(response.data);
          setCreatedObservationId(newArticleId);
          
          // Show appropriate success message
          const successMessage = isDraft ? 'Draft saved successfully' : 'تم إنشاء المقال بنجاح';
          if (isDraft) {
            toast.info(successMessage);
          } else {
            toast.success(successMessage);
          }
          
          console.log(`✅ ${isDraft ? 'Draft' : 'Article'} created successfully with ID:`, newArticleId);
          console.log('📄 Complete article data:', response.data);
          
          // Move to next step only if not draft
          if (!isDraft) {
            setCurrentStepId(2);
            setActiveStep(1);
            console.log('➡️ Moved to step 2 - Execution phase');
          }
          
          return newArticleId;
        } else {
          const errorMessage = isDraft ? 'Failed to save draft' : 'فشل في إنشاء المقال';
          toast.error(errorMessage);
          console.error(`❌ Failed to ${isDraft ? 'save draft' : 'create Observation'}:`, response);
          return null;
        }
      } else {
        const errorMessage = isDraft ? 'Failed to save draft' : 'فشل في إنشاء المقال';
        toast.error(errorMessage);
        console.error(`❌ Failed to ${isDraft ? 'save draft' : 'create Observation'}:`, result.error);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error ${isDraft ? 'saving draft' : 'submitting form'}:`, error);
      const errorMessage = isDraft ? 'Error saving draft' : 'حدث خطأ أثناء إنشاء المقال';
      toast.error(errorMessage);
      return null;
    }
  };

  // Handler for form submission - simplified to use common functions
  const handleFormSubmit = async (values: ObservationFormData) => {
    console.log('🚀 Form submission started');
    console.log('📝 Form values:', JSON.stringify(values, null, 2));
    
    const data = convertToAPIModel(values, false);
    return await createObservationAPI(data, 'Draft', false);
  };

  // Handler for step click navigation
  const handleStepClick = (stepId: number) => {
    setCurrentStepId(stepId);
    setActiveStep(stepId - 1); // MUI stepper is 0-indexed
  };

  // Common handler for Save, Save as Draft, and Next actions
  const handleFormAction = async (actionType: 'save' | 'saveAsDraft' | 'next') => {
    debugger
    if (currentStepId === 1) {
      if (!formikRef.current) {
        console.error('❌ FormikRef.current is null!');
        toast.error('Form reference not available');
        return;
      }

      console.log(`🔄 Handling ${actionType} action...`);

      // For Save as Draft, bypass validation and save directly
      if (actionType === 'saveAsDraft') {
        const currentValues = formikRef.current.values;
        console.log('💾 Saving as draft with values:', currentValues);
        
        const data = convertToAPIModel(currentValues, true);
        return await createObservationAPI(data, 'Draft', true);
      } 
      // For Save and Next, validate first then submit
      else if (actionType === 'save' || actionType === 'next') {
        console.log('🔍 FormikRef current:', formikRef.current);
        console.log('🔍 Form values:', formikRef.current.values);
        
        // Validate form for both Save and Next actions
        const errors = await formikRef.current.validateForm();
        console.log('🔍 Validation errors:', errors);
        
        formikRef.current.setTouched({
          observationTitle: true,
          discussion: true,
          conclusion: true,
          initialRecommendation: true,
          observationType: true,
          level: true,
          currentAssignment: true,
        });
        
        if (Object.keys(errors).length > 0) {
          // Show validation errors
          const errorMessage = actionType === 'next' ? 'Please fix form errors before proceeding' : 'Please fix form errors before saving';
          toast.error(errorMessage);
          console.log('❌ Form validation errors:', errors);
          return;
        }
        
        console.log('✅ Form is valid, submitting...');
        
        // Submit form for both Save and Next
        try {
          await formikRef.current.submitForm();
          // The handleFormSubmit function will be called automatically
          // For Next action, navigation happens in handleFormSubmit
        } catch (error) {
          console.error('Form submission error:', error);
          const errorMessage = actionType === 'next' ? 'Error submitting form' : 'Error saving form';
          toast.error(errorMessage);
        }
      }
    } 
    // Handle actions for other steps
    else if (actionType === 'next' && currentStepId < steps.length) {
      setCurrentStepId(currentStepId + 1);
      setActiveStep(activeStep + 1);
    } else if (actionType === 'save') {
      if (currentStepId === 2) {
        toast.success('Recommendations saved successfully');
      } else {
        toast.success('Data saved successfully');
      }
    } else if (actionType === 'saveAsDraft') {
      toast.info('Draft saved successfully');
    }
  };

  // Navigation handlers for buttons - now using common function
  const handleNext = async () => {
    await handleFormAction('next');
  };

  const handleSave = async () => {
    await handleFormAction('save');
  };

  const handleSaveAsDraft = async () => {
    await handleFormAction('saveAsDraft');
  };

  const handlePrevious = () => {
    if (currentStepId > 1) {
      setCurrentStepId(currentStepId - 1);
      setActiveStep(activeStep - 1);
    }
  };

  const handleCancel = () => {
    if (formikRef.current) {
      formikRef.current.resetForm();
    }
    toast.info('Operation cancelled');
  };

  let labelColor: string | undefined = undefined;
  let labelFontWeight: number | undefined = undefined;
  if (isActive) {
    labelColor = "var(--bs-app-sidebar-light-menu-link-bg-color-active)";
    labelFontWeight = 700;
  }

  // CustomStepIcon now inside StepperComponent to access steps
  const CustomStepIcon: React.FC<
    StepIconProps & {
      lastStep?: boolean;
      stepIndex?: number;
      isActive: boolean;
    }
  > = (props) => {
    const { stepIndex, isActive } = props;

    // Use stepIndex instead of icon for correct mapping
    const step = typeof stepIndex === "number" ? currentStepId : undefined;

    // Enhance: highlight current and previous step
    let iconColor = "#dfcfb6";
    let stepbgColor = "#FFF";
    let borderColor = "1px solid #B7945A";
    if (isActive) {
      iconColor = "#FFF";
      stepbgColor = "var(--bs-app-sidebar-light-menu-link-bg-color-active)";
      borderColor =
        "1px solid var(--bs-app-sidebar-light-menu-link-bg-color-active)";
    }
    return (
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "2px",
        }}
      >
        <span
          className="lbl-steps-semibold-1"
          style={{
            color: iconColor,
            backgroundColor: stepbgColor,
            border: borderColor,
            padding: "5px 10px",
            borderRadius: "1000px",
            width: "35px",
            height: "35px",
            zIndex: "999",
            marginTop: "5px",
          }}
        >
          {/* {stepIndex} */}
          {isActive && (
            <span
              //className="lbl-steps-semibold-1"
              style={{
                color: iconColor,
                backgroundColor: "#FFF",
                border: borderColor,
                padding: "5px 5px",
                borderRadius: "50px",
                position: "absolute",
                top: "16px",
              }}
            ></span>
          )}
        </span>
      </span>
    );
  };

  return (
    <Box className="observation-steppers-container">
      <Stepper
        activeStep={activeStep}
        alternativeLabel
        className="observation-stepper"
        aria-label="Workflow Steps"
        connector={<CustomConnector />}
      >
        {steps &&
          steps.map((step, index) => (
            <Step
              key={index}
              aria-current={currentStepId == step.stepId ? "step" : undefined}
              aria-disabled={currentStepId == step.stepId ? undefined : false}
              tabIndex={0}
              //onClick={() => step.stepId && handleStepClick(step.stepId)}
              className="observation-step"
            >
              <StepLabel
                // StepIconProps={{
                //     color: step.stepId == currentStepId ? "primary" : "disabled",
                // }}
                StepIconComponent={(props) => (
                  <CustomStepIcon
                    {...props}
                    stepIndex={index + 1}
                    isActive={currentStepId == step.stepId}
                  />
                )}
                className="observation-step-label"
              >
                <span
                  className="step-label-text"
                  style={{
                    color: labelColor,
                    fontWeight: labelFontWeight,
                  }}
                  aria-label={step.stepName}
                >
                  {step.stepName}
                </span>
              </StepLabel>
            </Step>
          ))}
      </Stepper>
      
      {/* Render step content based on currentStepId */}
      {currentStepId === 1 && (
        <Box className="step-content mx-5">
         
          
          {/* Loading State */}
          {loading && (
            <div className="d-flex justify-content-center mb-4 loading-container">
              <div className="spinner-border" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <div className="alert alert-danger mb-4 error-alert" role="alert">
              {error}
            </div>
          )}
          
          <ObservationForm 
            onSubmit={handleFormSubmit}
            mode="add"
            formikRef={formikRef}
          />
        </Box>
      )}
      
      {currentStepId === 2 && (
        <Box className="step-content mx-5">
          <h3>Step 2: Execution - Recommendations</h3>
          {createdObservationId ? (
            <Recommendation observationId={createdObservationId} />
          ) : (
            <Box className="recommendation-placeholder">
              <Typography variant="body1" color="text.secondary">
                Please complete Step 1 first to create an observation before adding recommendations.
              </Typography>
            </Box>
          )}
        </Box>
      )}
      
      {currentStepId === 3 && (
        <Box className="step-placeholder">
          <p>Review Step Content - Coming Soon</p>
        </Box>
      )}

      {/* Navigation Buttons */}
      <Box className="navigation-buttons">
        <Stack 
          direction="row" 
          justifyContent="space-between" 
          alignItems="center"
          className="navigation-buttons-stack"
        >
          {/* Left side buttons */}
          <Stack direction="row" spacing={2}>
         <></>
          </Stack>

          {/* Right side buttons */}
          <Stack direction="row" spacing={2} className="gap-8">
             <button
                type="button"
                className="btn MOD_btn2 btn-cancel stepper-bottom-btn m-0"
                style={{ minWidth: 120 }}
                onClick={handleCancel}
              >
                <BtnLabeltxtMedium2
                  customClassName="MOD_btn2_Label"
                  isI18nKey={true}
                  text={"BUTTON.LABEL.CANCEL"}
                />
                
              </button>
            {currentStepId > 1 && (
               
               <button
                type="button"
                className="btn MOD_btn2 btn-cancel stepper-bottom-btn m-0"
                style={{ minWidth: 120 }}
                onClick={handlePrevious}
              >
                <BtnLabeltxtMedium2
                  customClassName="MOD_btn2_Label"
                  isI18nKey={true}
                  text={"BUTTON.LABEL.BACK"}
                />
                <ArrowForwardIosIcon
                  style={{ marginLeft: "4px", fontSize: "18px" }}
                ></ArrowForwardIosIcon>
              </button>
            )}
            
            {currentStepId === 1 && (
              
               <button
                type="button"
                className="btn MOD_btn2 btn-cancel stepper-bottom-btn m-0"
                style={{ minWidth: 120 }}
                onClick={handleSaveAsDraft}
              >
                <BtnLabeltxtMedium2
                  customClassName="MOD_btn2_Label"
                  isI18nKey={true}
                  text={"Save as Draft"}
                />
                
              </button>
            )}
            
            {currentStepId === 1 && (
              
               <button
                type="button"
                className="btn MOD_btn2 btn-cancel stepper-bottom-btn m-0"
                style={{ minWidth: 120 }}
                onClick={handleSave}
              >
                <BtnLabeltxtMedium2
                  customClassName="MOD_btn2_Label"
                  isI18nKey={true}
                  text={"BUTTON.LABEL.SAVE"}
                />
                
              </button>
            )}
            
            {currentStepId < steps.length && (
             
              <button
                type="button"
                className="btn MOD_btn2 btn-cancel stepper-bottom-btn m-0"
                style={{ minWidth: 120 }}
                onClick={handleNext}
              >
                <BtnLabeltxtMedium2
                  customClassName="MOD_btn2_Label"
                  isI18nKey={true}
                  text={"BUTTON.LABEL.NEXT"}
                />
                <ArrowBackIosIcon
                  style={{ marginLeft: "4px", fontSize: "18px" }}
                ></ArrowBackIosIcon>
              </button>
            )}
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}; 