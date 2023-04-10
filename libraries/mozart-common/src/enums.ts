/* eslint-disable no-shadow */
export enum Aggregation {
  Count = "count",
  Sum = "sum",
  Min = "min",
  Max = "max",
  Avg = "avg",
}

export enum ValueType {
  String,
  Number,
  Boolean,
  Date,
  Object,
  Array,
}

export enum WhereType {
  Equal, // =
  LessThan, // <
  LessThanOrEqual, // <=
  MoreThan, // >
  MoreThanOrEqual, // >=
  Like,
  Between,
  IsNull,
  In,
  Any,
}

export enum OrderType {
  ASC,
  DESC,
}

export enum AggType {
  Count,
  Sum,
  Avg,
  Min,
  Max,
}

export enum SizeType {
  Fix = "fix",
  Rate = "rate",
}

export enum RepeatType {
  Never = "never",
  Yearly = "yearly",
  Monthly = "monthly",
  Weekly = "weekly",
}
