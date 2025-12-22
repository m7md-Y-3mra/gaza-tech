import { Cpu, HelpCircle, Mail } from "lucide-react";
import { FC } from "react";
import { LeftPanelProps } from "./types";
import { useLeftPanel } from "./hooks/useLeftPanel";
import Image from "next/image";

const LeftPanel: FC<LeftPanelProps> = ({ variant }) => {
  const { description, features, heading } = useLeftPanel(variant);

  return (
    <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-primary via-secondary to-emerald-700 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col justify-between p-12 w-full">
        {/* Brand Section */}
        <div>
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Cpu className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-white text-2xl font-bold">
                Gaza Tech Market
              </h1>
              <p className="text-green-100 text-sm">Technology Marketplace</p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="space-y-8">
          {variant === "verify-email" && (
            <div className="flex items-center justify-center py-8">
              <div className="w-64 h-64 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-xl">
                    <Mail className="w-12 h-12 text-primary" />
                  </div>
                  <p className="text-green-100 text-lg px-6">
                    Verification code sent
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-white text-4xl font-bold mb-4 leading-tight">
              {heading}
            </h2>
            <p className="text-green-100 text-lg">{description}</p>
          </div>

          <div className="space-y-6">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-green-100">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        {variant === "login" ? (
          <div className="grid grid-cols-3 gap-6 mt-5">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-white text-3xl font-bold mb-1">15K+</div>
              <div className="text-green-100 text-sm">Active Users</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-white text-3xl font-bold mb-1">8K+</div>
              <div className="text-green-100 text-sm">Products Listed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-white text-3xl font-bold mb-1">99%</div>
              <div className="text-green-100 text-sm">Satisfaction</div>
            </div>
          </div>
        ) : variant === "signup" ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mt-5">
            <div className="flex items-start space-x-4 mb-4">
              <Image
                src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg"
                alt="User testimonial"
                width={56}
                height={56}
                className="rounded-full border-2 border-white shadow-lg"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="w-4 h-4 text-yellow-300 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-white text-sm leading-relaxed mb-3">
                  &quot;Best tech marketplace in Gaza! I sold my laptop in just
                  2 days and the process was incredibly smooth.&quot;
                </p>
                <div>
                  <p className="text-white font-semibold text-sm">
                    Ahmed Hassan
                  </p>
                  <p className="text-green-100 text-xs">Verified Seller</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mt-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <HelpCircle className="w-5 h-5 text-white" />
                <span className="text-white font-medium">
                  Need help with verification?
                </span>
              </div>
              <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm font-semibold">
                Contact Support
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftPanel;
