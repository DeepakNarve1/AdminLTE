"use client";

import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/BlockSamitiForm";
import { RouteGuard } from "@app/components/RouteGuard";

export default function CreateBoothSamiti() {
  return (
    <RouteGuard requiredPermissions={["create_booth_samiti"]}>
      <GenericSamitiForm title="Booth Samiti" apiEndpoint="booth-samiti" />
    </RouteGuard>
  );
}
