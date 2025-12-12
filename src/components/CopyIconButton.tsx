import React, { useState } from "react";
import { IconButton, Tooltip } from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface CopyProps {
  value: string;
}

const CopyIconButton: React.FC<CopyProps> = ({ value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // сбросим через 2 секунды
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <Tooltip title={copied ? "Скопировано!" : "Скопировать"}>
      <IconButton onClick={handleCopy} size="small">
        <ContentCopyIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

export default CopyIconButton;
