interface ParamsArray {
  [key: string]: any;
}

interface Supplier {
  smVendorId: string;
  // Add other supplier properties
}

interface SupplierDetails {
  supplier: Supplier;
  vendor: any;
  registrations: any;
  workspace: any;
  cleanWorkspaceInfo: any;
  tasks: any[];
  externalRegistrationTask: any;
  internalRegistrationTask: any;
}

interface SearchSuppliersEvent {
  supplier: string;
  token: string;
}

interface ApproveVendorEvent {
  taskId: string;
  token: string;
}

interface State {
  apiToken: string | null;
  supplierNameSearchField: string | null;
  isAuthenticated: boolean;
}


declare module "*.vue" {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

