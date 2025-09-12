import { Box, Step, StepIconProps, StepLabel, Stepper } from "@mui/material";
import { WorkflowStepModel } from "../../../models/global/serviceWorkflow";
import { useState } from "react";

type Props = {
  workflowSteps: WorkflowStepModel[];
  currentStepId: number;
};

export const ServiceRequestStepper = ({
  workflowSteps,
  currentStepId,
}: Props) => {
  const [activeStep, setActiveStep] = useState<number>(currentStepId);
  const [isActive, setIsActive] = useState<boolean>(false);

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
                top: "11px",
              }}
            ></span>
          )}
        </span>
      </span>
    );
  };

  return (
    <Box sx={{ width: "100%", p: 4 }}>
      <Stepper
        activeStep={activeStep}
        alternativeLabel
        sx={{
          margin: "1rem 0",
          cursor: "default",
          "& .MuiStepLabel-root": {
            padding: "0 1rem",
          },
          ".MuiStepConnector-line": {
            borderTopWidth: "2px",
            borderColor: "#B7945A",
          },
          ".MuiStepConnector-root": {
            top: "15px",
            color: "#B7945A",
          },
        }}
        aria-label="Workflow Steps"
      >
        {workflowSteps &&
          workflowSteps.map((step, index) => (
            <Step
              key={index}
              aria-current={currentStepId == step.stepId ? "step" : undefined}
              aria-disabled={currentStepId == step.stepId ? undefined : false}
              tabIndex={0}
              sx={{
                "& .MuiStepLabel-root": {
                  padding: "0 0rem",
                },
                "& .MuiStepConnector-root":
                  "ar" === "ar"
                    ? {
                        right: "calc(-66% + 20px)",
                        left: "calc(30% + 20px)",
                      }
                    : {},
              }}
            >
              <StepLabel
                // StepIconProps={{
                //     color: step.stepId == currentStepId ? "primary" : "disabled",
                // }}
                StepIconComponent={(props) => (
                  <CustomStepIcon
                    {...props}
                    stepIndex={index + 1}
                    isActive={
                      currentStepId == step.stepId || currentStepId == 0
                    }
                  />
                )}
                sx={{
                  ".MuiStepLabel-label": {
                    fontFamily: "FrutigerLTArabic-Bold_2",
                    textAlign: "center",
                  },
                  ".MuiStepLabel-label:not(.Mui-error)": {},
                  ".MuiStepIcon-root.Mui-completed, .MuiStepIcon-root.Mui-active":
                    {
                      border: "none",
                    },
                }}
              >
                <span
                  style={{
                    color: labelColor,
                    fontWeight: labelFontWeight,
                    whiteSpace: "pre-wrap",
                  }}
                  aria-label={step.stepName}
                >
                  {step.stepName}
                </span>
              </StepLabel>
            </Step>
          ))}
      </Stepper>
    </Box>
  );
};
