interface KubeConfig {
  apiVersion: string;
  contexts: [{
    name: string;
  }];
  'current-context': string;
}

interface ObjectMeta {
  annotations?: { [key: string]: string; };
  creationTimestamp?: Date;
  deletionGracePeriodSeconds?: number;
  deletionTimestamp?: Date;
  finalizers?: Array<string>;
  generateName?: string;
  generation?: number;
  labels?: { [key: string]: string; };
  managedFields?: unknown;
  name?: string;
  namespace?: string;
  ownerReferences?: unknown;
  resourceVersion?: string;
  selfLink?: string;
  uid?: string;
}

interface LabelSelector {
  matchExpressions?: unknown;
  matchLabels?: { [key: string]: string; };
}

interface DeploymentSpec {
  minReadySeconds?: number;
  paused?: boolean;
  progressDeadlineSeconds?: number;
  replicas?: number;
  revisionHistoryLimit?: number;
  selector: LabelSelector;
  strategy?: unknown;
  template: unknown;
}

interface Deployment {
  apiVersion?: string;
  kind?: string;
  metadata?: ObjectMeta;
  spec?: DeploymentSpec;
  status?: unknown;
}

interface DeploymentList {
  apiVersion?: string;
  items: Array<Deployment>;
  kind?: string;
  metadata?: unknown;
}


interface Namespace {
  NAME: string;
  STATUS: string;
  AGE: string;
}

type NamespaceList = Array<Namespace>

interface Pod {
  NAME: string;
  READY: string;
  STATUS: string;
  RESTARTS: string;
  AGE: string;
}

type PodList = Array<Pod>