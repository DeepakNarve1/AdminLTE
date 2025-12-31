"use client";

import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/BlockSamitiForm";
import { RouteGuard } from "@app/components/RouteGuard";

export default function CreateBlockSamiti() {
  return (
    <RouteGuard requiredPermissions={["create_block_samiti"]}>
      <GenericSamitiForm title="Block Samiti" apiEndpoint="block-samiti" />
    </RouteGuard>
  );
}
