import React from "react";

interface LoadingProps {
  height: string;
  width: string;
  borderWidth: string;
}

const LoadingComponent: React.FC<LoadingProps> = ({ height, width, borderWidth }) => {
  const containerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial, sans-serif",
  };

  const spinnerStyle: React.CSSProperties = {
    borderWidth,
    borderStyle: "solid",
    borderColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: "50%",
    borderTopWidth: borderWidth,
    borderTopStyle: "solid",
    borderTopColor: "white",
    height,
    width,
    animation: "spin 2s ease-in infinite",
  };
  return (
    <div style={containerStyle}>
      <div style={spinnerStyle} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
          
          
        }
      `}</style>
    </div>
  );
};

export default LoadingComponent;
