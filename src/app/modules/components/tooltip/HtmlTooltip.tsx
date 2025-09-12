import { Tooltip, TooltipProps, styled, tooltipClasses } from '@mui/material';

export const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip arrow {...props} classes={{ popper: className }} disableInteractive={false}/>
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: '#fff !important',
      color: '#212529ed',
      boxShadow: "0px 3px 14px #0000007a !important",
      fontSize: theme.typography.pxToRem(15),
      border: '1px solid #70707003',      
    },
  }));