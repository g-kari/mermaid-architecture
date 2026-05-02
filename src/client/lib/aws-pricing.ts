export interface PricingTier {
  label: string;
  monthlyCost: number;
}

export interface ServicePricing {
  serviceId: string;
  minimumMonthlyCost: number;
  pricingUnit: string;
  pricingNote: string;
  tiers?: Record<string, PricingTier[]>;
  free?: boolean;
}

export const AWS_PRICING: Record<string, ServicePricing> = {
  ec2: {
    serviceId: "ec2",
    minimumMonthlyCost: 7.59,
    pricingUnit: "インスタンス/月",
    pricingNote:
      "オンデマンド料金 (us-east-1)。リザーブドインスタンスやSavings Plansで最大72%割引可能",
    tiers: {
      instanceType: [
        { label: "t3.nano", monthlyCost: 3.8 },
        { label: "t3.micro", monthlyCost: 7.59 },
        { label: "t3.small", monthlyCost: 15.18 },
        { label: "t3.medium", monthlyCost: 30.37 },
        { label: "t3.large", monthlyCost: 60.74 },
        { label: "t3.xlarge", monthlyCost: 121.47 },
        { label: "m6i.large", monthlyCost: 69.35 },
        { label: "m6i.xlarge", monthlyCost: 138.7 },
        { label: "c6i.large", monthlyCost: 62.05 },
        { label: "r6i.large", monthlyCost: 91.98 },
      ],
    },
  },
  lambda: {
    serviceId: "lambda",
    minimumMonthlyCost: 0,
    pricingUnit: "リクエスト/100万 + GB秒",
    pricingNote:
      "毎月100万リクエスト・40万GB秒まで無料。超過分は$0.20/100万リクエスト + $0.0000166667/GB秒",
  },
  lightsail: {
    serviceId: "lightsail",
    minimumMonthlyCost: 3.5,
    pricingUnit: "インスタンス/月",
    pricingNote: "最小プラン $3.50/月 (512MB RAM, 1vCPU, 20GB SSD)。3ヶ月間無料枠あり",
    tiers: {
      plan: [
        { label: "$3.50/月 (512MB)", monthlyCost: 3.5 },
        { label: "$5/月 (1GB)", monthlyCost: 5 },
        { label: "$10/月 (2GB)", monthlyCost: 10 },
        { label: "$20/月 (4GB)", monthlyCost: 20 },
        { label: "$40/月 (8GB)", monthlyCost: 40 },
        { label: "$80/月 (16GB)", monthlyCost: 80 },
        { label: "$160/月 (32GB)", monthlyCost: 160 },
      ],
    },
  },
  batch: {
    serviceId: "batch",
    minimumMonthlyCost: 0,
    pricingUnit: "基盤リソース課金",
    pricingNote: "Batch自体は無料。実行するEC2/Fargateリソースに対して課金",
    free: true,
  },
  "elastic-beanstalk": {
    serviceId: "elastic-beanstalk",
    minimumMonthlyCost: 0,
    pricingUnit: "基盤リソース課金",
    pricingNote:
      "Elastic Beanstalk自体は無料。プロビジョニングされるEC2/RDS等のリソースに対して課金",
    free: true,
  },
  "app-runner": {
    serviceId: "app-runner",
    minimumMonthlyCost: 5.07,
    pricingUnit: "vCPU時間 + GBメモリ時間",
    pricingNote:
      "最小構成 (0.25vCPU/0.5GB) で一時停止中も最低料金が発生。アクティブ時は$0.064/vCPU時間 + $0.007/GBメモリ時間",
    tiers: {
      cpu: [
        { label: "0.25 vCPU / 0.5 GB", monthlyCost: 5.07 },
        { label: "0.5 vCPU / 1 GB", monthlyCost: 10.14 },
        { label: "1 vCPU / 2 GB", monthlyCost: 43.07 },
        { label: "2 vCPU / 4 GB", monthlyCost: 86.14 },
        { label: "4 vCPU / 8 GB", monthlyCost: 172.28 },
      ],
    },
  },
  ecs: {
    serviceId: "ecs",
    minimumMonthlyCost: 0,
    pricingUnit: "起動タイプによる",
    pricingNote: "EC2起動タイプはEC2料金のみ。Fargate起動タイプは別途Fargate料金",
  },
  "ecs-fargate": {
    serviceId: "ecs-fargate",
    minimumMonthlyCost: 9.22,
    pricingUnit: "vCPU時間 + GBメモリ時間",
    pricingNote: "最小構成 0.25vCPU/0.5GB。$0.04048/vCPU時間 + $0.004445/GBメモリ時間",
    tiers: {
      cpu: [
        { label: "0.25 vCPU / 0.5 GB", monthlyCost: 9.22 },
        { label: "0.5 vCPU / 1 GB", monthlyCost: 18.43 },
        { label: "1 vCPU / 2 GB", monthlyCost: 36.86 },
        { label: "2 vCPU / 4 GB", monthlyCost: 73.73 },
        { label: "4 vCPU / 8 GB", monthlyCost: 147.46 },
      ],
    },
  },
  eks: {
    serviceId: "eks",
    minimumMonthlyCost: 72,
    pricingUnit: "クラスター/月",
    pricingNote: "クラスター料金 $0.10/時間 ($72/月)。ワーカーノードのEC2/Fargate料金は別途",
    tiers: {
      nodeType: [
        { label: "t3.medium (クラスター+ノード1台)", monthlyCost: 102.37 },
        { label: "t3.large (クラスター+ノード1台)", monthlyCost: 132.74 },
        { label: "m6i.large (クラスター+ノード1台)", monthlyCost: 141.35 },
        { label: "m6i.xlarge (クラスター+ノード1台)", monthlyCost: 210.7 },
      ],
    },
  },
  ecr: {
    serviceId: "ecr",
    minimumMonthlyCost: 0,
    pricingUnit: "GB/月",
    pricingNote: "プライベートリポジトリ $0.10/GB/月。パブリックリポジトリは50GBまで無料",
  },
  s3: {
    serviceId: "s3",
    minimumMonthlyCost: 0.23,
    pricingUnit: "GB/月",
    pricingNote: "Standard: $0.023/GB/月。最低料金10GB想定。PUT/GET等のリクエスト料金は別途",
    tiers: {
      storageClass: [
        { label: "Standard (10GB)", monthlyCost: 0.23 },
        { label: "Standard-IA (10GB)", monthlyCost: 0.125 },
        { label: "One Zone-IA (10GB)", monthlyCost: 0.1 },
        { label: "Glacier Instant Retrieval (10GB)", monthlyCost: 0.04 },
        { label: "Intelligent-Tiering (10GB)", monthlyCost: 0.23 },
      ],
    },
  },
  efs: {
    serviceId: "efs",
    minimumMonthlyCost: 0.3,
    pricingUnit: "GB/月",
    pricingNote: "Standard: $0.30/GB/月。Infrequent Access: $0.025/GB/月 + アクセス料金",
  },
  ebs: {
    serviceId: "ebs",
    minimumMonthlyCost: 0.8,
    pricingUnit: "GB/月",
    pricingNote: "gp3: $0.08/GB/月 (最低10GB想定)。3,000 IOPS・125 MB/sスループット込み",
    tiers: {
      volumeType: [
        { label: "gp3 (10GB)", monthlyCost: 0.8 },
        { label: "gp2 (10GB)", monthlyCost: 1.0 },
        { label: "io1 (10GB)", monthlyCost: 1.25 },
        { label: "io2 (10GB)", monthlyCost: 1.25 },
        { label: "st1 (125GB最小)", monthlyCost: 5.63 },
        { label: "sc1 (125GB最小)", monthlyCost: 1.88 },
      ],
    },
  },
  glacier: {
    serviceId: "glacier",
    minimumMonthlyCost: 0.04,
    pricingUnit: "GB/月",
    pricingNote:
      "S3 Glacier Flexible Retrieval: $0.0036/GB/月。Deep Archive: $0.00099/GB/月。取得料金は別途",
  },
  backup: {
    serviceId: "backup",
    minimumMonthlyCost: 0.05,
    pricingUnit: "GB/月",
    pricingNote: "EBSスナップショット: $0.05/GB/月。サービスごとに料金が異なる",
  },
  "storage-gateway": {
    serviceId: "storage-gateway",
    minimumMonthlyCost: 0,
    pricingUnit: "GB/月",
    pricingNote: "ゲートウェイ自体は無料。S3ストレージ・データ転送料金が別途発生",
  },
  rds: {
    serviceId: "rds",
    minimumMonthlyCost: 12.41,
    pricingUnit: "インスタンス/月",
    pricingNote: "シングルAZオンデマンド料金。Multi-AZは約2倍。ストレージ・IO料金は別途",
    tiers: {
      instanceClass: [
        { label: "db.t3.micro", monthlyCost: 12.41 },
        { label: "db.t3.small", monthlyCost: 24.82 },
        { label: "db.t3.medium", monthlyCost: 49.64 },
        { label: "db.r6g.large", monthlyCost: 131.4 },
        { label: "db.r6g.xlarge", monthlyCost: 262.8 },
      ],
    },
  },
  aurora: {
    serviceId: "aurora",
    minimumMonthlyCost: 43.8,
    pricingUnit: "インスタンス/月 または ACU時間",
    pricingNote:
      "Serverless v2最小0.5ACU: $43.80/月。プロビジョンドはdb.r6g.largeで$197.10/月〜。ストレージ $0.10/GB/月",
    tiers: {
      instanceClass: [
        { label: "Serverless v2 (0.5 ACU)", monthlyCost: 43.8 },
        { label: "Serverless v2 (1 ACU)", monthlyCost: 87.6 },
        { label: "db.r6g.large", monthlyCost: 197.1 },
        { label: "db.r6g.xlarge", monthlyCost: 394.2 },
        { label: "db.r6g.2xlarge", monthlyCost: 788.4 },
      ],
    },
  },
  dynamodb: {
    serviceId: "dynamodb",
    minimumMonthlyCost: 0,
    pricingUnit: "RCU/WCU または リクエスト",
    pricingNote:
      "オンデマンド: 読み取り$0.25/100万、書き込み$1.25/100万。25 RCU/25 WCUまで無料枠 (プロビジョンド)",
  },
  elasticache: {
    serviceId: "elasticache",
    minimumMonthlyCost: 12.24,
    pricingUnit: "ノード/月",
    pricingNote: "オンデマンド料金。リザーブドノードで最大55%割引可能。Serverlessは使用量ベース",
    tiers: {
      nodeType: [
        { label: "cache.t3.micro", monthlyCost: 12.24 },
        { label: "cache.t3.small", monthlyCost: 24.48 },
        { label: "cache.t3.medium", monthlyCost: 48.96 },
        { label: "cache.r6g.large", monthlyCost: 131.4 },
        { label: "cache.r6g.xlarge", monthlyCost: 262.8 },
      ],
    },
  },
  redshift: {
    serviceId: "redshift",
    minimumMonthlyCost: 180,
    pricingUnit: "ノード/月",
    pricingNote: "dc2.large: $0.25/時間 ($180/月)。Serverlessは使用RPU時間ベース ($0.375/RPU時間)",
    tiers: {
      nodeType: [
        { label: "dc2.large", monthlyCost: 180 },
        { label: "dc2.8xlarge", monthlyCost: 3420 },
        { label: "ra3.xlplus", monthlyCost: 759 },
        { label: "ra3.4xlarge", monthlyCost: 2337 },
        { label: "ra3.16xlarge", monthlyCost: 9882 },
      ],
    },
  },
  neptune: {
    serviceId: "neptune",
    minimumMonthlyCost: 145,
    pricingUnit: "インスタンス/月",
    pricingNote:
      "db.t3.medium: $0.201/時間 ($145/月)。ストレージ $0.10/GB/月、IO $0.20/100万リクエスト",
  },
  documentdb: {
    serviceId: "documentdb",
    minimumMonthlyCost: 145,
    pricingUnit: "インスタンス/月",
    pricingNote:
      "db.t3.medium: $0.201/時間 ($145/月)。ストレージ $0.10/GB/月、IO $0.20/100万リクエスト",
  },
  keyspaces: {
    serviceId: "keyspaces",
    minimumMonthlyCost: 0,
    pricingUnit: "リクエスト + ストレージ",
    pricingNote: "オンデマンド: 読み取り$0.283/100万、書き込み$1.454/100万。ストレージ $0.25/GB/月",
  },
  timestream: {
    serviceId: "timestream",
    minimumMonthlyCost: 0,
    pricingUnit: "書き込み + ストレージ + クエリ",
    pricingNote:
      "書き込み$0.50/100万レコード。メモリストア$0.036/GB時間。マグネティックストア$0.03/GB/月",
  },
  vpc: {
    serviceId: "vpc",
    minimumMonthlyCost: 0,
    pricingUnit: "無料",
    pricingNote: "VPC自体は無料。NAT Gateway、VPNなどの付随サービスは別途課金",
    free: true,
  },
  alb: {
    serviceId: "alb",
    minimumMonthlyCost: 16.2,
    pricingUnit: "ALB/月 + LCU時間",
    pricingNote:
      "固定費 $0.0225/時間 ($16.20/月) + LCU $0.008/時間。LCUは新規接続・アクティブ接続・帯域・ルール評価の最大値",
  },
  nlb: {
    serviceId: "nlb",
    minimumMonthlyCost: 16.2,
    pricingUnit: "NLB/月 + NLCU時間",
    pricingNote: "固定費 $0.0225/時間 ($16.20/月) + NLCU $0.006/時間",
  },
  cloudfront: {
    serviceId: "cloudfront",
    minimumMonthlyCost: 1,
    pricingUnit: "GB転送 + リクエスト",
    pricingNote: "最初の1TB/月: $0.085/GB。1,000万HTTPリクエスト: $0.0075。毎月1TBまで無料枠あり",
  },
  route53: {
    serviceId: "route53",
    minimumMonthlyCost: 0.5,
    pricingUnit: "ホストゾーン/月",
    pricingNote: "$0.50/ホストゾーン/月 (最初の25ゾーン)。クエリ $0.40/100万 (Standard)",
  },
  "api-gateway": {
    serviceId: "api-gateway",
    minimumMonthlyCost: 0,
    pricingUnit: "リクエスト/100万",
    pricingNote:
      "REST API: $3.50/100万リクエスト。HTTP API: $1.00/100万リクエスト。100万リクエスト/月まで12ヶ月無料",
  },
  "nat-gateway": {
    serviceId: "nat-gateway",
    minimumMonthlyCost: 32.4,
    pricingUnit: "ゲートウェイ/月 + GB処理",
    pricingNote: "固定費 $0.045/時間 ($32.40/月) + データ処理 $0.045/GB",
  },
  "direct-connect": {
    serviceId: "direct-connect",
    minimumMonthlyCost: 0.03,
    pricingUnit: "GB転送 + ポート時間",
    pricingNote:
      "データ転送 $0.02〜$0.03/GB (リージョン依存)。ポート料金は容量により $0.03〜$1.50/時間",
  },
  "global-accelerator": {
    serviceId: "global-accelerator",
    minimumMonthlyCost: 18,
    pricingUnit: "アクセラレーター/月 + GB転送",
    pricingNote: "固定費 $0.025/時間 ($18/月) + データ転送 $0.015〜$0.035/GB (DT-Premium)",
  },
  "transit-gateway": {
    serviceId: "transit-gateway",
    minimumMonthlyCost: 36,
    pricingUnit: "アタッチメント/月 + GB処理",
    pricingNote: "$0.05/アタッチメント/時間 ($36/月) + データ処理 $0.02/GB",
  },
  sqs: {
    serviceId: "sqs",
    minimumMonthlyCost: 0,
    pricingUnit: "リクエスト/100万",
    pricingNote:
      "Standard: $0.40/100万リクエスト、FIFO: $0.50/100万リクエスト。毎月100万リクエストまで無料",
  },
  sns: {
    serviceId: "sns",
    minimumMonthlyCost: 0,
    pricingUnit: "リクエスト/100万",
    pricingNote: "最初の100万リクエスト/月は無料。超過分は$0.50/100万リクエスト。SMSは別途料金",
  },
  eventbridge: {
    serviceId: "eventbridge",
    minimumMonthlyCost: 0,
    pricingUnit: "イベント/100万",
    pricingNote: "カスタムイベント $1.00/100万イベント。AWSサービスイベントは無料",
  },
  ses: {
    serviceId: "ses",
    minimumMonthlyCost: 0,
    pricingUnit: "メール/1,000通",
    pricingNote: "EC2からの送信は62,000通/月まで無料。超過分は$0.10/1,000通。受信は$0.10/1,000通",
  },
  "step-functions": {
    serviceId: "step-functions",
    minimumMonthlyCost: 0,
    pricingUnit: "状態遷移/100万",
    pricingNote:
      "Standard: $25/100万状態遷移。Express: $1/100万リクエスト + コンピュート料金。毎月4,000遷移まで無料",
  },
  appsync: {
    serviceId: "appsync",
    minimumMonthlyCost: 0,
    pricingUnit: "クエリ/100万 + リアルタイム更新",
    pricingNote: "クエリ・ミューテーション $4.00/100万。リアルタイム更新 $2.00/100万接続分",
  },
  mq: {
    serviceId: "mq",
    minimumMonthlyCost: 21.9,
    pricingUnit: "ブローカー/月",
    pricingNote: "mq.t3.micro: $0.03/時間 ($21.90/月)。ストレージ $0.10/GB/月",
    tiers: {
      instanceType: [
        { label: "mq.t3.micro", monthlyCost: 21.9 },
        { label: "mq.m5.large", monthlyCost: 218.4 },
        { label: "mq.m5.xlarge", monthlyCost: 436.8 },
      ],
    },
  },
  "app-mesh": {
    serviceId: "app-mesh",
    minimumMonthlyCost: 0,
    pricingUnit: "無料",
    pricingNote: "App Mesh自体は無料。Envoyプロキシのコンピュートリソースが別途必要",
    free: true,
  },
  iam: {
    serviceId: "iam",
    minimumMonthlyCost: 0,
    pricingUnit: "無料",
    pricingNote: "IAMは完全無料。ユーザー、ロール、ポリシーの作成・管理に課金なし",
    free: true,
  },
  waf: {
    serviceId: "waf",
    minimumMonthlyCost: 6,
    pricingUnit: "Web ACL/月 + ルール/月",
    pricingNote:
      "Web ACL $5/月 + ルール $1/月。リクエスト $0.60/100万。マネージドルールグループは別途",
  },
  acm: {
    serviceId: "acm",
    minimumMonthlyCost: 0,
    pricingUnit: "無料",
    pricingNote: "パブリックSSL/TLS証明書は無料。プライベート証明書は$0.75/証明書/月",
    free: true,
  },
  cognito: {
    serviceId: "cognito",
    minimumMonthlyCost: 0,
    pricingUnit: "MAU/月",
    pricingNote: "最初の50,000 MAUまで無料 (Essentials)。超過分は$0.015/MAU (50,001〜100,000)",
  },
  kms: {
    serviceId: "kms",
    minimumMonthlyCost: 1,
    pricingUnit: "キー/月",
    pricingNote: "カスタマー管理キー $1/月。AWS管理キーは無料。API呼び出し $0.03/10,000リクエスト",
  },
  "secrets-manager": {
    serviceId: "secrets-manager",
    minimumMonthlyCost: 0.4,
    pricingUnit: "シークレット/月",
    pricingNote: "$0.40/シークレット/月。API呼び出し $0.05/10,000リクエスト",
  },
  shield: {
    serviceId: "shield",
    minimumMonthlyCost: 0,
    pricingUnit: "プラン依存",
    pricingNote:
      "Shield Standard: 無料 (全AWSアカウントに自動適用)。Shield Advanced: $3,000/月 + データ転送料金",
  },
  guardduty: {
    serviceId: "guardduty",
    minimumMonthlyCost: 4,
    pricingUnit: "分析量ベース",
    pricingNote:
      "VPCフローログ・DNSクエリ: $1.00/GB (最初500GB)。CloudTrailイベント: $4.00/100万イベント",
  },
  "security-hub": {
    serviceId: "security-hub",
    minimumMonthlyCost: 0,
    pricingUnit: "チェック/月",
    pricingNote:
      "最初の10,000チェック/アカウント/リージョン/月まで $0.0010/チェック。30日間無料トライアルあり",
  },
  cloudwatch: {
    serviceId: "cloudwatch",
    minimumMonthlyCost: 0,
    pricingUnit: "メトリクス/アラーム/ログ",
    pricingNote:
      "基本モニタリング (5分間隔) は無料。カスタムメトリクス $0.30/月、アラーム $0.10/月、ログ取り込み $0.50/GB",
  },
  cloudformation: {
    serviceId: "cloudformation",
    minimumMonthlyCost: 0,
    pricingUnit: "無料",
    pricingNote:
      "CloudFormation自体は無料。作成されるリソースに対して課金。サードパーティリソースは$0.0009/オペレーション",
    free: true,
  },
  ssm: {
    serviceId: "ssm",
    minimumMonthlyCost: 0,
    pricingUnit: "無料 (基本機能)",
    pricingNote:
      "Session Manager、Run Command等の基本機能は無料。Advanced Parameter $0.05/パラメータ/月",
    free: true,
  },
  cloudtrail: {
    serviceId: "cloudtrail",
    minimumMonthlyCost: 0,
    pricingUnit: "イベント/100,000",
    pricingNote:
      "管理イベント: 最初の証跡1つまで無料。追加コピーは$2.00/100,000イベント。データイベントは$0.10/100,000イベント",
  },
  config: {
    serviceId: "config",
    minimumMonthlyCost: 2,
    pricingUnit: "ルール評価/月",
    pricingNote: "設定項目の記録 $0.003/項目。ルール評価 $0.001/評価。Conformance Pack $0.001/評価",
  },
  "trusted-advisor": {
    serviceId: "trusted-advisor",
    minimumMonthlyCost: 0,
    pricingUnit: "無料 (Basic)",
    pricingNote:
      "Basic: 6つのコアチェック無料。フルチェックはBusiness/Enterprise Supportプラン必要",
    free: true,
  },
  organizations: {
    serviceId: "organizations",
    minimumMonthlyCost: 0,
    pricingUnit: "無料",
    pricingNote: "AWS Organizations自体は無料。組織内の各アカウントのリソース利用に対して課金",
    free: true,
  },
  kinesis: {
    serviceId: "kinesis",
    minimumMonthlyCost: 15,
    pricingUnit: "シャード/月",
    pricingNote:
      "Data Streams: $0.015/シャード時間 ($10.80/シャード/月) + PUT $0.014/100万レコード。Firehose: $0.029/GB",
    tiers: {
      shardCount: [
        { label: "1 シャード", monthlyCost: 15 },
        { label: "2 シャード", monthlyCost: 30 },
        { label: "5 シャード", monthlyCost: 75 },
        { label: "10 シャード", monthlyCost: 150 },
      ],
    },
  },
  athena: {
    serviceId: "athena",
    minimumMonthlyCost: 0,
    pricingUnit: "TB/スキャン",
    pricingNote: "$5/TBスキャン。パーティション・圧縮・カラムナーフォーマットで大幅削減可能",
  },
  glue: {
    serviceId: "glue",
    minimumMonthlyCost: 0,
    pricingUnit: "DPU時間",
    pricingNote: "ETLジョブ: $0.44/DPU時間。データカタログ: 最初の100万オブジェクトまで無料",
  },
  quicksight: {
    serviceId: "quicksight",
    minimumMonthlyCost: 9,
    pricingUnit: "ユーザー/月",
    pricingNote:
      "Standard: $9/ユーザー/月 (年間契約)。Enterprise: $18/ユーザー/月。Reader: $0.30/セッション (最大$5/月)",
  },
  msk: {
    serviceId: "msk",
    minimumMonthlyCost: 54.75,
    pricingUnit: "ブローカー/月",
    pricingNote: "kafka.t3.small: $0.075/時間 ($54.75/月)。ストレージ $0.10/GB/月",
    tiers: {
      instanceType: [
        { label: "kafka.t3.small", monthlyCost: 54.75 },
        { label: "kafka.m5.large", monthlyCost: 175.2 },
        { label: "kafka.m5.xlarge", monthlyCost: 350.4 },
        { label: "kafka.m5.2xlarge", monthlyCost: 700.8 },
      ],
    },
  },
  opensearch: {
    serviceId: "opensearch",
    minimumMonthlyCost: 46.92,
    pricingUnit: "インスタンス/月",
    pricingNote:
      "t3.small.search: $0.0651/時間 ($46.92/月)。EBSストレージ $0.115/GB/月。マスターノードは別途",
    tiers: {
      instanceType: [
        { label: "t3.small.search", monthlyCost: 46.92 },
        { label: "t3.medium.search", monthlyCost: 58.03 },
        { label: "m6g.large.search", monthlyCost: 113.88 },
        { label: "r6g.large.search", monthlyCost: 142.35 },
        { label: "r6g.xlarge.search", monthlyCost: 284.7 },
      ],
    },
  },
  "lake-formation": {
    serviceId: "lake-formation",
    minimumMonthlyCost: 0,
    pricingUnit: "無料",
    pricingNote: "Lake Formation自体は無料。基盤のS3・Glue等のリソース料金が別途発生",
    free: true,
  },
  emr: {
    serviceId: "emr",
    minimumMonthlyCost: 10.95,
    pricingUnit: "インスタンス時間",
    pricingNote:
      "EC2料金 + EMR料金。m5.xlarge EMR料金: $0.048/時間。Serverlessは$0.052624/vCPU時間",
  },
  codepipeline: {
    serviceId: "codepipeline",
    minimumMonthlyCost: 1,
    pricingUnit: "パイプライン/月",
    pricingNote:
      "V1パイプライン: $1/月。V2パイプライン: アクション実行ごとに$0.002 (最初の100分/月は無料)",
  },
  codecommit: {
    serviceId: "codecommit",
    minimumMonthlyCost: 0,
    pricingUnit: "ユーザー/月",
    pricingNote: "最初の5ユーザーまで無料。追加ユーザー $1/月。Gitリクエスト2,000/月まで無料",
    free: true,
  },
  codebuild: {
    serviceId: "codebuild",
    minimumMonthlyCost: 0,
    pricingUnit: "ビルド分",
    pricingNote: "general1.small: $0.005/ビルド分。毎月100ビルド分まで無料",
  },
  codedeploy: {
    serviceId: "codedeploy",
    minimumMonthlyCost: 0,
    pricingUnit: "無料 (EC2/Lambda)",
    pricingNote:
      "EC2/Lambda/ECSへのデプロイは無料。オンプレミスインスタンスへのデプロイは$0.02/更新",
    free: true,
  },
  codestar: {
    serviceId: "codestar",
    minimumMonthlyCost: 0,
    pricingUnit: "無料",
    pricingNote:
      "CodeStar自体は無料。プロビジョニングされるリソース (EC2, CodeBuild等) に対して課金",
    free: true,
  },
  xray: {
    serviceId: "xray",
    minimumMonthlyCost: 0,
    pricingUnit: "トレース/100万",
    pricingNote:
      "記録: $5/100万トレース。取得・スキャン: $0.50/100万トレース。毎月10万トレースまで無料",
  },
  amplify: {
    serviceId: "amplify",
    minimumMonthlyCost: 0,
    pricingUnit: "ビルド分 + ホスティングGB",
    pricingNote:
      "ビルド: $0.01/ビルド分。ホスティング: $0.023/GB配信。毎月1,000ビルド分・15GB配信まで無料",
  },
  sagemaker: {
    serviceId: "sagemaker",
    minimumMonthlyCost: 37.13,
    pricingUnit: "インスタンス/月",
    pricingNote:
      "ml.t3.medium: $0.0509/時間 ($37.13/月)。ノートブック・トレーニング・推論で料金体系が異なる",
    tiers: {
      instanceType: [
        { label: "ml.t3.medium", monthlyCost: 37.13 },
        { label: "ml.t3.large", monthlyCost: 74.26 },
        { label: "ml.m5.xlarge", monthlyCost: 167.9 },
        { label: "ml.c5.xlarge", monthlyCost: 149.94 },
        { label: "ml.p3.2xlarge", monthlyCost: 2216.16 },
      ],
    },
  },
  bedrock: {
    serviceId: "bedrock",
    minimumMonthlyCost: 0,
    pricingUnit: "入出力トークン",
    pricingNote:
      "使用量ベース課金。Claude Sonnet: 入力$3/100万トークン、出力$15/100万トークン。Provisioned Throughputは別料金体系",
  },
  user: {
    serviceId: "user",
    minimumMonthlyCost: 0,
    pricingUnit: "N/A",
    pricingNote: "ユーザー/クライアントはAWSサービスではないため課金なし",
    free: true,
  },
};

export function getServicePricing(serviceId: string): ServicePricing | undefined {
  return AWS_PRICING[serviceId];
}

export interface SpecOption {
  value: string;
  label: string;
  monthlyCost: number;
}

export function getSpecOptions(serviceId: string, specKey: string): SpecOption[] | null {
  const pricing = AWS_PRICING[serviceId];
  if (!pricing?.tiers) {
    return null;
  }
  const tiers = pricing.tiers[specKey];
  if (!tiers) {
    return null;
  }
  return tiers.map((tier) => ({
    value: tier.label,
    label: `${tier.label} - $${tier.monthlyCost.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}/月`,
    monthlyCost: tier.monthlyCost,
  }));
}
