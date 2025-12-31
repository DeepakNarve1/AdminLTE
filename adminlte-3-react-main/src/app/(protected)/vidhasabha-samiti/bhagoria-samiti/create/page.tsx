"use client";

import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/BlockSamitiForm";
import { RouteGuard } from "@app/components/RouteGuard";

export default function CreateBhagoriaSamiti() {
  return (
    <RouteGuard requiredPermissions={["create_bhagoria_samiti"]}>
      <GenericSamitiForm
        title="Bhagoria Samiti"
        apiEndpoint="bhagoria-samiti"
      />
    </RouteGuard>
  );
}
