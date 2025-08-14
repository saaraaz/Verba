"use client";

import React, { useState, useEffect } from "react";
import { Credentials, NodePayload, CollectionPayload } from "@/app/types";
import { IoTrash, IoDocumentSharp, IoReload } from "react-icons/io5";
import { FaWrench } from "react-icons/fa";
import { deleteAllDocuments, fetchMeta } from "@/app/api";
import UserModalComponent from "../Navigation/UserModal";

import VerbaButton from "../Navigation/VerbaButton";
import { useTranslation } from "@/context/TranslationContext";

interface InfoViewProps {
  credentials: Credentials;
  addStatusMessage: (
    message: string,
    type: "INFO" | "WARNING" | "SUCCESS" | "ERROR"
  ) => void;
}

const InfoView: React.FC<InfoViewProps> = ({
  credentials,
  addStatusMessage,
}) => {
  const [nodePayload, setNodePayload] = useState<NodePayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [collectionPayload, setCollectionPayload] =
    useState<CollectionPayload | null>(null);

  const { t } = useTranslation();

  const fetchMetadata = async () => {
    setIsLoading(true);
    const metaData = await fetchMeta(credentials);
    if (metaData?.error === "") {
      setNodePayload(metaData.node_payload);
      setCollectionPayload(metaData.collection_payload);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchMetadata();
    setIsLoading(false);
  }, []);

  const resetDocuments = async () => {
    const response = await deleteAllDocuments("DOCUMENTS", credentials);
    if (response) {
      addStatusMessage(
        t("settings.status.reset_documents", "All documents reset"),
        "SUCCESS"
      );
      fetchMetadata();
    } else {
      addStatusMessage(
        t(
          "settings.status.reset_documents_failed",
          "Failed to reset documents"
        ),
        "ERROR"
      );
    }
  };

  const resetVerba = async () => {
    const response = await deleteAllDocuments("ALL", credentials);
    if (response) {
      addStatusMessage(
        t("settings.status.reset_verba", "Verba reset"),
        "SUCCESS"
      );
      fetchMetadata();
    } else {
      addStatusMessage(
        t("settings.status.reset_verba_failed", "Failed to reset Verba"),
        "ERROR"
      );
    }
  };

  const resetConfig = async () => {
    const response = await deleteAllDocuments("CONFIG", credentials);
    if (response) {
      addStatusMessage(
        t("settings.status.reset_config", "Config reset"),
        "SUCCESS"
      );
      fetchMetadata();
    } else {
      addStatusMessage(
        t("settings.status.reset_config_failed", "Failed to reset config"),
        "ERROR"
      );
    }
  };

  const resetSuggestions = async () => {
    const response = await deleteAllDocuments("SUGGESTIONS", credentials);
    if (response) {
      addStatusMessage(
        t("settings.status.reset_suggestions", "Suggestions reset"),
        "SUCCESS"
      );
      fetchMetadata();
    } else {
      addStatusMessage(
        t(
          "settings.status.reset_suggestions_failed",
          "Failed to reset suggestions"
        ),
        "ERROR"
      );
    }
  };

  const openModal = (modal_id: string) => {
    const modal = document.getElementById(modal_id);
    if (modal instanceof HTMLDialogElement) {
      modal.showModal();
    }
  };

  return (
    <div className="flex flex-col w-full h-full p-4">
      <div className="flex justify-between items-center mb-4">
        <p className="text-2xl font-bold">
          {t("settings.admin_panel", "Admin Panel")}
        </p>
        <VerbaButton
          title={t("common.refresh", "Refresh")}
          loading={isLoading}
          onClick={fetchMetadata}
          className="max-w-min"
          Icon={IoReload}
        />
      </div>
      <div className="flex-grow overflow-y-auto">
        <div className="gap-4 flex flex-col p-4 text-text-verba">
          <p className="font-bold text-lg">
            {t("settings.section.resetting_verba", "Resetting Verba")}
          </p>
          <div className="flex flex-wrap gap-2 justify-between">
            <div className="flex flex-wrap gap-2">
              <VerbaButton
                title={t("settings.clear_documents", "Clear Documents")}
                onClick={() => openModal("reset-documents")}
                Icon={IoDocumentSharp}
              />
              <VerbaButton
                title={t("settings.clear_config", "Clear Config")}
                onClick={() => openModal("reset-configs")}
                Icon={FaWrench}
              />
              <VerbaButton
                title={t("settings.clear_everything", "Clear Everything")}
                onClick={() => openModal("reset-verba")}
                Icon={IoTrash}
              />
              <VerbaButton
                title={t("settings.clear_suggestions", "Clear Suggestions")}
                onClick={() => openModal("reset-suggestions")}
                Icon={IoTrash}
              />
            </div>
          </div>
          <p className="font-bold text-lg">
            {t("settings.section.weaviate_information", "Weaviate Information")}
          </p>

          <div className="flex flex-col border-2 gap-2 border-bg-verba shadow-sm p-4 rounded-lg">
            <p className="text-sm lg:text-base font-semibold text-text-alt-verba">
              {t("settings.connected_to", "Connected to")}
            </p>
            <p className="   text-text-verba">{credentials.url}</p>
          </div>

          <div className="flex flex-col border-2 gap-2 border-bg-verba shadow-sm p-4 rounded-lg">
            <p className="text-sm lg:text-base font-semibold text-text-alt-verba">
              {t("settings.deployment", "Deployment")}
            </p>
            <p className=" text-text-verba">{credentials.deployment}</p>
          </div>

          <div className="flex flex-col border-2 gap-2 border-secondary-verba shadow-sm p-4 rounded-lg">
            <p className="text-sm lg:text-base font-semibold text-text-alt-verba">
              {t("settings.version", "Version")}
            </p>
            {nodePayload ? (
              <p className="text-text-verba">{nodePayload.weaviate_version}</p>
            ) : (
              <span className="loading loading-spinner loading-sm"></span>
            )}
          </div>

          <div className="flex flex-col border-2 border-bg-verba shadow-sm p-4 rounded-lg">
            <div className="flex gap-2 items-center">
              <p className="text-text-alt-verba text-sm lg:text-base font-semibold">
                {t("settings.nodes", "Nodes")}
              </p>
              {nodePayload ? (
                <p className="text-text-alt-verba text-sm lg:text-base font-semibold">
                  {nodePayload.node_count}
                </p>
              ) : (
                <span className="loading loading-spinner loading-sm"></span>
              )}
            </div>

            {nodePayload ? (
              <ul className="flex flex-col mt-2 list-disc list-inside">
                {nodePayload.nodes.map((node) => (
                  <li
                    key={"Node" + node.name}
                    className="text-sm text-text-verba flex justify-between"
                  >
                    <span className="w-64 truncate">{node.name}</span>
                    <span>
                      ({t(node.status, node.status)} - {node.shards}{" "}
                      {t("settings.shards", "shards")})
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="loading loading-dots loading-sm mt-2"></span>
            )}
          </div>

          <div className="flex flex-col border-2 border-bg-verba shadow-sm p-4 rounded-lg">
            <div className="flex gap-2 items-center">
              <p className="text-text-alt-verba text-sm lg:text-base font-semibold">
                {t("settings.collections", "Collections")}
              </p>
              {collectionPayload ? (
                <p className="text-text-alt-verba text-sm lg:text-base font-semibold">
                  {collectionPayload.collection_count}
                </p>
              ) : (
                <span className="loading loading-spinner loading-sm"></span>
              )}
            </div>

            {collectionPayload ? (
              <ul className="flex flex-col mt-2 list-disc list-inside">
                {collectionPayload.collections.map((collection) => (
                  <li
                    key={"Collection" + collection.name}
                    className="text-sm text-text-verba flex justify-between"
                  >
                    <span className="w-128 truncate">{collection.name}</span>
                    <span>
                      {collection.count} {t("settings.objects", "objects")}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="loading loading-dots loading-sm mt-2"></span>
            )}
          </div>
        </div>
      </div>
      <UserModalComponent
        modal_id="reset-documents"
        title={t("settings.modal.reset_documents.title", "Reset Documents")}
        text={t(
          "settings.modal.reset_documents.text",
          "Are you sure you want to reset all documents? This will clear all documents and chunks from Verba."
        )}
        triggerAccept={resetDocuments}
        triggerString={t("common.reset", "Reset")}
      />
      <UserModalComponent
        modal_id="reset-configs"
        title={t("settings.modal.reset_config.title", "Reset Config")}
        text={t(
          "settings.modal.reset_config.text",
          "Are you sure you want to reset the config?"
        )}
        triggerAccept={resetConfig}
        triggerString={t("common.reset", "Reset")}
      />
      <UserModalComponent
        modal_id="reset-verba"
        title={t("settings.modal.reset_verba.title", "Reset Verba")}
        text={t(
          "settings.modal.reset_verba.text",
          "Are you sure you want to reset Verba? This will delete all collections related to Verba."
        )}
        triggerAccept={resetVerba}
        triggerString={t("common.reset", "Reset")}
      />
      <UserModalComponent
        modal_id="reset-suggestions"
        title={t("settings.modal.reset_suggestions.title", "Reset Suggestions")}
        text={t(
          "settings.modal.reset_suggestions.text",
          "Are you sure you want to reset all autocomplete suggestions?"
        )}
        triggerAccept={resetSuggestions}
        triggerString={t("common.reset", "Reset")}
      />
    </div>
  );
};

export default InfoView;
