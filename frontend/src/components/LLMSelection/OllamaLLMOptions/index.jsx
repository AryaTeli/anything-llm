import React, { useEffect, useState } from "react";
import System from "@/models/system";
import PreLoader from "@/components/Preloader";
import { CaretDown, CaretUp, Info } from "@phosphor-icons/react";
import useProviderEndpointAutoDiscovery from "@/hooks/useProviderEndpointAutoDiscovery";
import { Tooltip } from "react-tooltip";

const DEFAULT_OLLAMA_ENDPOINTS = ["http://127.0.0.1:11434"]; // Set default endpoints

export default function OllamaLLMOptions({ settings }) {
  const {
    autoDetecting: loading,
    basePath,
    basePathValue,
    showAdvancedControls,
    setShowAdvancedControls,
    handleAutoDetectClick,
  } = useProviderEndpointAutoDiscovery({
    provider: "ollama",
    initialBasePath: settings?.OllamaLLMBasePath || DEFAULT_OLLAMA_ENDPOINTS[0],
    ENDPOINTS: DEFAULT_OLLAMA_ENDPOINTS, // Ensuring default endpoints
  });
  const [performanceMode, setPerformanceMode] = useState(
    settings?.OllamaLLMPerformanceMode || "base"
  );
  const [maxTokens, setMaxTokens] = useState(
    settings?.OllamaLLMTokenLimit || 4096
  );

  return (
    <div className="w-full flex flex-col gap-y-7">
      <div className="w-full flex items-start gap-[36px] mt-1.5">
        <OllamaLLMModelSelection settings={settings} basePath={basePath.value} />
        <div className="flex flex-col w-60">
          <label className="text-white text-sm font-semibold block mb-2">
            Max Tokens
          </label>
          <input
            type="number"
            name="OllamaLLMTokenLimit"
            className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
            placeholder="4096"
            min={1}
            value={maxTokens}
            onChange={(e) => setMaxTokens(Number(e.target.value))}
            onScroll={(e) => e.target.blur()}
            required
            autoComplete="off"
          />
        </div>
      </div>
      <div className="flex justify-start mt-4">
        <button
          onClick={(e) => {
            e.preventDefault();
            setShowAdvancedControls(!showAdvancedControls);
          }}
          className="border-none text-theme-text-primary hover:text-theme-text-secondary flex items-center text-sm"
        >
          {showAdvancedControls ? "Hide" : "Show"} advanced settings
          {showAdvancedControls ? (
            <CaretUp size={14} className="ml-1" />
          ) : (
            <CaretDown size={14} className="ml-1" />
          )}
        </button>
      </div>

      <div hidden={!showAdvancedControls}>
        <div className="w-full flex items-start gap-4">
          <div className="flex flex-col w-60">
            <label className="text-white text-sm font-semibold block mb-2">
              Ollama Base URL
            </label>
            <input
              type="url"
              name="OllamaLLMBasePath"
              className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
              placeholder="http://127.0.0.1:11434"
              value={basePathValue.value}
              required
              autoComplete="off"
              spellCheck={false}
              onChange={basePath.onChange}
              onBlur={basePath.onBlur}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function OllamaLLMModelSelection({ settings, basePath = null }) {
  const [customModels, setCustomModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function findCustomModels() {
      if (!basePath) {
        setCustomModels([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { models } = await System.customModels("ollama", null, basePath);
        setCustomModels(models || []);
      } catch (error) {
        console.error("Failed to fetch custom models:", error);
        setCustomModels([]);
      }
      setLoading(false);
    }
    findCustomModels();
  }, [basePath]);

  return (
    <div className="flex flex-col w-60">
      <label className="text-white text-sm font-semibold block mb-2">
        Ollama Model
      </label>
      <select
        name="OllamaLLMModelPref"
        required
        className="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
      >
        {customModels.length > 0 ? (
          <optgroup label="Your loaded models">
            {customModels.map((model) => (
              <option
                key={model.id}
                value={model.id}
                selected={settings.OllamaLLMModelPref === model.id}
              >
                {model.id}
              </option>
            ))}
          </optgroup>
        ) : (
          <option disabled>
            {!!basePath ? "--loading available models--" : "Enter Ollama URL first"}
          </option>
        )}
      </select>
    </div>
  );
}
