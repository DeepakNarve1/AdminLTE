"use client";

import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/BlockSamitiForm";
import { RouteGuard } from "@app/components/RouteGuard";

export default function CreateDpSamiti() {
  return (
    <RouteGuard requiredPermissions={["create_dp_samiti"]}>
      <GenericSamitiForm title="DP Samiti" apiEndpoint="dp-samiti" />
    </RouteGuard>
  );
}
