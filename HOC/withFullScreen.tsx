import { ComponentType } from "react";

const withFullScreen = <P extends object>(
  Component: ComponentType<P>
): ComponentType<P> => {
  const WrappedComponent = (props: P) => {
    return (
      <div className="flex h-screen items-center justify-center">
        <Component {...props} />
      </div>
    );
  };

  WrappedComponent.displayName = `withFullScreen(${
    Component.displayName || Component.name || "Component"
  })`;

  return WrappedComponent;
};

export default withFullScreen;
