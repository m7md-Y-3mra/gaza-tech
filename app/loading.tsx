import LoadingComponent from "@/components/loading";
import withFullScreen from "@/HOC/withFullScreen";

const FullScreenLoading = withFullScreen(LoadingComponent);

export default function Loading() {
  return <FullScreenLoading />;
}
