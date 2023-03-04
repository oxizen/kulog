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

interface Container {
  args?: Array<string>;
  command?: Array<string>;
  env?: Array<unknown>;
  envFrom?: Array<unknown>;
  image?: string;
  imagePullPolicy?: string;
  lifecycle?: unknown;
  livenessProbe?: unknown;
  name: string;
  ports?: Array<unknown>;
  readinessProbe?: unknown;
  resources?: unknown;
  securityContext?: unknown;
  startupProbe?: unknown;
  stdin?: boolean;
  stdinOnce?: boolean;
  terminationMessagePath?: string;
  terminationMessagePolicy?: string;
  tty?: boolean;
  volumeDevices?: Array<unknown>;
  volumeMounts?: Array<unknown>;
  workingDir?: string;
}

interface PodSpec {
  activeDeadlineSeconds?: number;
  affinity?: unknown;
  automountServiceAccountToken?: boolean;
  containers: Array<Container>;
  dnsConfig?: unknown;
  dnsPolicy?: string;
  enableServiceLinks?: boolean;
  ephemeralContainers?: Array<unknown>;
  hostAliases?: Array<unknown>;
  hostIPC?: boolean;
  hostNetwork?: boolean;
  hostPID?: boolean;
  hostUsers?: boolean;
  hostname?: string;
  imagePullSecrets?: Array<unknown>;
  initContainers?: Array<unknown>;
  nodeName?: string;
  nodeSelector?: { [key: string]: string; };
  os?: V1PodOS;
  overhead?: { [key: string]: string; };
  preemptionPolicy?: string;
  priority?: number;
  priorityClassName?: string;
  readinessGates?: Array<unknown>;
  restartPolicy?: string;
  runtimeClassName?: string;
  schedulerName?: string;
  securityContext?: unknown;
  serviceAccount?: string;
  serviceAccountName?: string;
  setHostnameAsFQDN?: boolean;
  shareProcessNamespace?: boolean;
  subdomain?: string;
  terminationGracePeriodSeconds?: number;
  tolerations?: Array<unknown>;
  topologySpreadConstraints?: Array<unknown>;
  volumes?: Array<unknown>;
}

interface PodTemplateSpec {
  metadata: ObjectMeta;
  spec: PodSpec;
}

interface DeploymentSpec {
  minReadySeconds?: number;
  paused?: boolean;
  progressDeadlineSeconds?: number;
  replicas?: number;
  revisionHistoryLimit?: number;
  selector: LabelSelector;
  strategy?: unknown;
  template: PodTemplateSpec;
}

type DeploymentAvailableConditionReason = 'MinimumReplicasAvailable';
type DeploymentProgressingConditionReason = 'NewReplicaSetAvailable' | 'NewReplicaSetCreated' | 'FoundNewReplicaSet' | 'ReplicaSetUpdated';
type DeploymentConditionReason = DeploymentAvailableConditionReason | DeploymentProgressingConditionReason;
interface DeploymentCondition {
  lastTransitionTime?: Date;
  lastUpdateTime?: Date;
  message?: string;
  reason?: DeploymentConditionReason;
  status: 'True' | 'False';
  type: 'Available' | 'Progressing' | 'ReplicaFailure';
}

interface DeploymentStatus {
  availableReplicas?: number;
  collisionCount?: number;
  conditions: Array<DeploymentCondition>;
  observedGeneration?: number;
  readyReplicas?: number;
  replicas?: number;
  unavailableReplicas?: number;
  updatedReplicas?: number;

}

interface Deployment {
  apiVersion?: string;
  kind?: string;
  metadata: ObjectMeta;
  spec: DeploymentSpec;
  status: DeploymentStatus;
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