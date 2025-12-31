"use client";

import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/BlockSamitiForm";
import { RouteGuard } from "@app/components/RouteGuard";

export default function CreateTenkarSamiti() {
  return (
    <RouteGuard requiredPermissions={["create_tenkar_samiti"]}>
      <GenericSamitiForm title="Tenkar Samiti" apiEndpoint="tenkar-samiti" />
    </RouteGuard>
  );
}
