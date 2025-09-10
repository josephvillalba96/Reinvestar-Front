import React from "react";
import DocumentsManager from "../../../../../components/DocumentsManager";

const DocumentsRequest = ({ requestId, requestType }) => {
  return (
    <DocumentsManager 
      requestId={requestId} 
      requestType={requestType} 
      isEnabled={!!requestId} 
    />
  );
};

export default DocumentsRequest;