export type Maybe<T> = T | null
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
  /** Big number integer */
  BigInt: any
  /** A date-time string in simplified extended ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ) */
  DateTime: any
}

/** A Gateway Account */
export type Account = {
  /** Unique identifier (can be sequential) */
  id: Scalars['String']
  /** The user associated with the gateway account (the Gateway Account Owner) */
  user: User
  /** Gateway account's e-mail address */
  email: Scalars['String']
  /** Indicates whether the gateway account's e-mail has been confirmed or not. */
  isEmailConfirmed: Scalars['Boolean']
  /** Indicates whether the access to the gateway account is blocked */
  isBlocked: Scalars['Boolean']
  /** Time when the gateway account was registered */
  registeredAt: Scalars['DateTime']
  /** On-chain membership associated with the gateway account */
  membership: Membership
  /** Blockchain (joystream) account associated with the gateway account */
  joystreamAccount: Scalars['String']
  /** runtime notifications */
  notifications: Array<Notification>
  /** notification preferences for the account */
  notificationPreferences: AccountNotificationPreferences
  /** ID of the channel which referred the user to the platform */
  referrerChannelId?: Maybe<Scalars['String']>
}

/** A Gateway Account */
export type AccountNotificationsArgs = {
  where?: Maybe<NotificationWhereInput>
  orderBy?: Maybe<Array<NotificationOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type AccountData = {
  id: Scalars['String']
  email: Scalars['String']
  joystreamAccount: Scalars['String']
  isEmailConfirmed: Scalars['Boolean']
  membershipId: Scalars['String']
  followedChannels: Array<FollowedChannel>
  preferences?: Maybe<AccountNotificationPreferencesOutput>
}

export type AccountEdge = {
  node: Account
  cursor: Scalars['String']
}

export type AccountNotificationPreferences = {
  channelExcludedFromApp: NotificationPreference
  videoExcludedFromApp: NotificationPreference
  nftFeaturedOnMarketPlace: NotificationPreference
  newChannelFollower: NotificationPreference
  videoCommentCreated: NotificationPreference
  videoLiked: NotificationPreference
  videoDisliked: NotificationPreference
  yppChannelVerified: NotificationPreference
  yppSignupSuccessful: NotificationPreference
  yppChannelSuspended: NotificationPreference
  nftBought: NotificationPreference
  creatorTimedAuctionExpired: NotificationPreference
  bidMadeOnNft: NotificationPreference
  royaltyReceived: NotificationPreference
  channelPaymentReceived: NotificationPreference
  channelReceivedFundsFromWg: NotificationPreference
  newPayoutUpdatedByCouncil: NotificationPreference
  channelFundsWithdrawn: NotificationPreference
  channelCreated: NotificationPreference
  replyToComment: NotificationPreference
  reactionToComment: NotificationPreference
  videoPosted: NotificationPreference
  newNftOnAuction: NotificationPreference
  newNftOnSale: NotificationPreference
  timedAuctionExpired: NotificationPreference
  higherBidThanYoursMade: NotificationPreference
  auctionWon: NotificationPreference
  auctionLost: NotificationPreference
  openAuctionBidCanBeWithdrawn: NotificationPreference
  fundsFromCouncilReceived: NotificationPreference
  fundsToExternalWalletSent: NotificationPreference
  fundsFromWgReceived: NotificationPreference
}

export type AccountNotificationPreferencesInput = {
  channelExcludedFromApp?: Maybe<NotificationPreferenceGql>
  videoExcludedFromApp?: Maybe<NotificationPreferenceGql>
  nftFeaturedOnMarketPlace?: Maybe<NotificationPreferenceGql>
  newChannelFollower?: Maybe<NotificationPreferenceGql>
  videoCommentCreated?: Maybe<NotificationPreferenceGql>
  videoLiked?: Maybe<NotificationPreferenceGql>
  videoDisliked?: Maybe<NotificationPreferenceGql>
  yppChannelVerified?: Maybe<NotificationPreferenceGql>
  yppSignupSuccessful?: Maybe<NotificationPreferenceGql>
  yppChannelSuspended?: Maybe<NotificationPreferenceGql>
  nftBought?: Maybe<NotificationPreferenceGql>
  creatorTimedAuctionExpired?: Maybe<NotificationPreferenceGql>
  bidMadeOnNft?: Maybe<NotificationPreferenceGql>
  royaltyReceived?: Maybe<NotificationPreferenceGql>
  channelPaymentReceived?: Maybe<NotificationPreferenceGql>
  channelReceivedFundsFromWg?: Maybe<NotificationPreferenceGql>
  newPayoutUpdatedByCouncil?: Maybe<NotificationPreferenceGql>
  channelFundsWithdrawn?: Maybe<NotificationPreferenceGql>
  channelCreated?: Maybe<NotificationPreferenceGql>
  replyToComment?: Maybe<NotificationPreferenceGql>
  reactionToComment?: Maybe<NotificationPreferenceGql>
  videoPosted?: Maybe<NotificationPreferenceGql>
  newNftOnAuction?: Maybe<NotificationPreferenceGql>
  newNftOnSale?: Maybe<NotificationPreferenceGql>
  timedAuctionExpired?: Maybe<NotificationPreferenceGql>
  higherBidThanYoursMade?: Maybe<NotificationPreferenceGql>
  auctionWon?: Maybe<NotificationPreferenceGql>
  auctionLost?: Maybe<NotificationPreferenceGql>
  openAuctionBidCanBeWithdrawn?: Maybe<NotificationPreferenceGql>
  fundsFromCouncilReceived?: Maybe<NotificationPreferenceGql>
  fundsToExternalWalletSent?: Maybe<NotificationPreferenceGql>
  fundsFromWgReceived?: Maybe<NotificationPreferenceGql>
}

export type AccountNotificationPreferencesOutput = {
  channelExcludedFromApp?: Maybe<NotificationPreferenceOutput>
  videoExcludedFromApp?: Maybe<NotificationPreferenceOutput>
  nftFeaturedOnMarketPlace?: Maybe<NotificationPreferenceOutput>
  newChannelFollower?: Maybe<NotificationPreferenceOutput>
  videoCommentCreated?: Maybe<NotificationPreferenceOutput>
  videoLiked?: Maybe<NotificationPreferenceOutput>
  videoDisliked?: Maybe<NotificationPreferenceOutput>
  yppChannelVerified?: Maybe<NotificationPreferenceOutput>
  yppSignupSuccessful?: Maybe<NotificationPreferenceOutput>
  yppChannelSuspended?: Maybe<NotificationPreferenceOutput>
  nftBought?: Maybe<NotificationPreferenceOutput>
  creatorTimedAuctionExpired?: Maybe<NotificationPreferenceOutput>
  bidMadeOnNft?: Maybe<NotificationPreferenceOutput>
  royaltyReceived?: Maybe<NotificationPreferenceOutput>
  channelPaymentReceived?: Maybe<NotificationPreferenceOutput>
  channelReceivedFundsFromWg?: Maybe<NotificationPreferenceOutput>
  newPayoutUpdatedByCouncil?: Maybe<NotificationPreferenceOutput>
  channelFundsWithdrawn?: Maybe<NotificationPreferenceOutput>
  channelCreated?: Maybe<NotificationPreferenceOutput>
  replyToComment?: Maybe<NotificationPreferenceOutput>
  reactionToComment?: Maybe<NotificationPreferenceOutput>
  videoPosted?: Maybe<NotificationPreferenceOutput>
  newNftOnAuction?: Maybe<NotificationPreferenceOutput>
  newNftOnSale?: Maybe<NotificationPreferenceOutput>
  timedAuctionExpired?: Maybe<NotificationPreferenceOutput>
  higherBidThanYoursMade?: Maybe<NotificationPreferenceOutput>
  auctionWon?: Maybe<NotificationPreferenceOutput>
  auctionLost?: Maybe<NotificationPreferenceOutput>
  openAuctionBidCanBeWithdrawn?: Maybe<NotificationPreferenceOutput>
  fundsFromCouncilReceived?: Maybe<NotificationPreferenceOutput>
  fundsToExternalWalletSent?: Maybe<NotificationPreferenceOutput>
  fundsFromWgReceived?: Maybe<NotificationPreferenceOutput>
}

export type AccountNotificationPreferencesResult = {
  newPreferences: AccountNotificationPreferencesOutput
}

export type AccountNotificationPreferencesWhereInput = {
  channelExcludedFromApp_isNull?: Maybe<Scalars['Boolean']>
  channelExcludedFromApp?: Maybe<NotificationPreferenceWhereInput>
  videoExcludedFromApp_isNull?: Maybe<Scalars['Boolean']>
  videoExcludedFromApp?: Maybe<NotificationPreferenceWhereInput>
  nftFeaturedOnMarketPlace_isNull?: Maybe<Scalars['Boolean']>
  nftFeaturedOnMarketPlace?: Maybe<NotificationPreferenceWhereInput>
  newChannelFollower_isNull?: Maybe<Scalars['Boolean']>
  newChannelFollower?: Maybe<NotificationPreferenceWhereInput>
  videoCommentCreated_isNull?: Maybe<Scalars['Boolean']>
  videoCommentCreated?: Maybe<NotificationPreferenceWhereInput>
  videoLiked_isNull?: Maybe<Scalars['Boolean']>
  videoLiked?: Maybe<NotificationPreferenceWhereInput>
  videoDisliked_isNull?: Maybe<Scalars['Boolean']>
  videoDisliked?: Maybe<NotificationPreferenceWhereInput>
  yppChannelVerified_isNull?: Maybe<Scalars['Boolean']>
  yppChannelVerified?: Maybe<NotificationPreferenceWhereInput>
  yppSignupSuccessful_isNull?: Maybe<Scalars['Boolean']>
  yppSignupSuccessful?: Maybe<NotificationPreferenceWhereInput>
  yppChannelSuspended_isNull?: Maybe<Scalars['Boolean']>
  yppChannelSuspended?: Maybe<NotificationPreferenceWhereInput>
  nftBought_isNull?: Maybe<Scalars['Boolean']>
  nftBought?: Maybe<NotificationPreferenceWhereInput>
  creatorTimedAuctionExpired_isNull?: Maybe<Scalars['Boolean']>
  creatorTimedAuctionExpired?: Maybe<NotificationPreferenceWhereInput>
  bidMadeOnNft_isNull?: Maybe<Scalars['Boolean']>
  bidMadeOnNft?: Maybe<NotificationPreferenceWhereInput>
  royaltyReceived_isNull?: Maybe<Scalars['Boolean']>
  royaltyReceived?: Maybe<NotificationPreferenceWhereInput>
  channelPaymentReceived_isNull?: Maybe<Scalars['Boolean']>
  channelPaymentReceived?: Maybe<NotificationPreferenceWhereInput>
  channelReceivedFundsFromWg_isNull?: Maybe<Scalars['Boolean']>
  channelReceivedFundsFromWg?: Maybe<NotificationPreferenceWhereInput>
  newPayoutUpdatedByCouncil_isNull?: Maybe<Scalars['Boolean']>
  newPayoutUpdatedByCouncil?: Maybe<NotificationPreferenceWhereInput>
  channelFundsWithdrawn_isNull?: Maybe<Scalars['Boolean']>
  channelFundsWithdrawn?: Maybe<NotificationPreferenceWhereInput>
  channelCreated_isNull?: Maybe<Scalars['Boolean']>
  channelCreated?: Maybe<NotificationPreferenceWhereInput>
  replyToComment_isNull?: Maybe<Scalars['Boolean']>
  replyToComment?: Maybe<NotificationPreferenceWhereInput>
  reactionToComment_isNull?: Maybe<Scalars['Boolean']>
  reactionToComment?: Maybe<NotificationPreferenceWhereInput>
  videoPosted_isNull?: Maybe<Scalars['Boolean']>
  videoPosted?: Maybe<NotificationPreferenceWhereInput>
  newNftOnAuction_isNull?: Maybe<Scalars['Boolean']>
  newNftOnAuction?: Maybe<NotificationPreferenceWhereInput>
  newNftOnSale_isNull?: Maybe<Scalars['Boolean']>
  newNftOnSale?: Maybe<NotificationPreferenceWhereInput>
  timedAuctionExpired_isNull?: Maybe<Scalars['Boolean']>
  timedAuctionExpired?: Maybe<NotificationPreferenceWhereInput>
  higherBidThanYoursMade_isNull?: Maybe<Scalars['Boolean']>
  higherBidThanYoursMade?: Maybe<NotificationPreferenceWhereInput>
  auctionWon_isNull?: Maybe<Scalars['Boolean']>
  auctionWon?: Maybe<NotificationPreferenceWhereInput>
  auctionLost_isNull?: Maybe<Scalars['Boolean']>
  auctionLost?: Maybe<NotificationPreferenceWhereInput>
  openAuctionBidCanBeWithdrawn_isNull?: Maybe<Scalars['Boolean']>
  openAuctionBidCanBeWithdrawn?: Maybe<NotificationPreferenceWhereInput>
  fundsFromCouncilReceived_isNull?: Maybe<Scalars['Boolean']>
  fundsFromCouncilReceived?: Maybe<NotificationPreferenceWhereInput>
  fundsToExternalWalletSent_isNull?: Maybe<Scalars['Boolean']>
  fundsToExternalWalletSent?: Maybe<NotificationPreferenceWhereInput>
  fundsFromWgReceived_isNull?: Maybe<Scalars['Boolean']>
  fundsFromWgReceived?: Maybe<NotificationPreferenceWhereInput>
}

export enum AccountOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  UserIdAsc = 'user_id_ASC',
  UserIdDesc = 'user_id_DESC',
  UserIsRootAsc = 'user_isRoot_ASC',
  UserIsRootDesc = 'user_isRoot_DESC',
  EmailAsc = 'email_ASC',
  EmailDesc = 'email_DESC',
  IsEmailConfirmedAsc = 'isEmailConfirmed_ASC',
  IsEmailConfirmedDesc = 'isEmailConfirmed_DESC',
  IsBlockedAsc = 'isBlocked_ASC',
  IsBlockedDesc = 'isBlocked_DESC',
  RegisteredAtAsc = 'registeredAt_ASC',
  RegisteredAtDesc = 'registeredAt_DESC',
  MembershipIdAsc = 'membership_id_ASC',
  MembershipIdDesc = 'membership_id_DESC',
  MembershipCreatedAtAsc = 'membership_createdAt_ASC',
  MembershipCreatedAtDesc = 'membership_createdAt_DESC',
  MembershipHandleAsc = 'membership_handle_ASC',
  MembershipHandleDesc = 'membership_handle_DESC',
  MembershipHandleRawAsc = 'membership_handleRaw_ASC',
  MembershipHandleRawDesc = 'membership_handleRaw_DESC',
  MembershipControllerAccountAsc = 'membership_controllerAccount_ASC',
  MembershipControllerAccountDesc = 'membership_controllerAccount_DESC',
  MembershipTotalChannelsCreatedAsc = 'membership_totalChannelsCreated_ASC',
  MembershipTotalChannelsCreatedDesc = 'membership_totalChannelsCreated_DESC',
  JoystreamAccountAsc = 'joystreamAccount_ASC',
  JoystreamAccountDesc = 'joystreamAccount_DESC',
  ReferrerChannelIdAsc = 'referrerChannelId_ASC',
  ReferrerChannelIdDesc = 'referrerChannelId_DESC',
}

export type AccountWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  user_isNull?: Maybe<Scalars['Boolean']>
  user?: Maybe<UserWhereInput>
  email_isNull?: Maybe<Scalars['Boolean']>
  email_eq?: Maybe<Scalars['String']>
  email_not_eq?: Maybe<Scalars['String']>
  email_gt?: Maybe<Scalars['String']>
  email_gte?: Maybe<Scalars['String']>
  email_lt?: Maybe<Scalars['String']>
  email_lte?: Maybe<Scalars['String']>
  email_in?: Maybe<Array<Scalars['String']>>
  email_not_in?: Maybe<Array<Scalars['String']>>
  email_contains?: Maybe<Scalars['String']>
  email_not_contains?: Maybe<Scalars['String']>
  email_containsInsensitive?: Maybe<Scalars['String']>
  email_not_containsInsensitive?: Maybe<Scalars['String']>
  email_startsWith?: Maybe<Scalars['String']>
  email_not_startsWith?: Maybe<Scalars['String']>
  email_endsWith?: Maybe<Scalars['String']>
  email_not_endsWith?: Maybe<Scalars['String']>
  isEmailConfirmed_isNull?: Maybe<Scalars['Boolean']>
  isEmailConfirmed_eq?: Maybe<Scalars['Boolean']>
  isEmailConfirmed_not_eq?: Maybe<Scalars['Boolean']>
  isBlocked_isNull?: Maybe<Scalars['Boolean']>
  isBlocked_eq?: Maybe<Scalars['Boolean']>
  isBlocked_not_eq?: Maybe<Scalars['Boolean']>
  registeredAt_isNull?: Maybe<Scalars['Boolean']>
  registeredAt_eq?: Maybe<Scalars['DateTime']>
  registeredAt_not_eq?: Maybe<Scalars['DateTime']>
  registeredAt_gt?: Maybe<Scalars['DateTime']>
  registeredAt_gte?: Maybe<Scalars['DateTime']>
  registeredAt_lt?: Maybe<Scalars['DateTime']>
  registeredAt_lte?: Maybe<Scalars['DateTime']>
  registeredAt_in?: Maybe<Array<Scalars['DateTime']>>
  registeredAt_not_in?: Maybe<Array<Scalars['DateTime']>>
  membership_isNull?: Maybe<Scalars['Boolean']>
  membership?: Maybe<MembershipWhereInput>
  joystreamAccount_isNull?: Maybe<Scalars['Boolean']>
  joystreamAccount_eq?: Maybe<Scalars['String']>
  joystreamAccount_not_eq?: Maybe<Scalars['String']>
  joystreamAccount_gt?: Maybe<Scalars['String']>
  joystreamAccount_gte?: Maybe<Scalars['String']>
  joystreamAccount_lt?: Maybe<Scalars['String']>
  joystreamAccount_lte?: Maybe<Scalars['String']>
  joystreamAccount_in?: Maybe<Array<Scalars['String']>>
  joystreamAccount_not_in?: Maybe<Array<Scalars['String']>>
  joystreamAccount_contains?: Maybe<Scalars['String']>
  joystreamAccount_not_contains?: Maybe<Scalars['String']>
  joystreamAccount_containsInsensitive?: Maybe<Scalars['String']>
  joystreamAccount_not_containsInsensitive?: Maybe<Scalars['String']>
  joystreamAccount_startsWith?: Maybe<Scalars['String']>
  joystreamAccount_not_startsWith?: Maybe<Scalars['String']>
  joystreamAccount_endsWith?: Maybe<Scalars['String']>
  joystreamAccount_not_endsWith?: Maybe<Scalars['String']>
  notifications_every?: Maybe<NotificationWhereInput>
  notifications_some?: Maybe<NotificationWhereInput>
  notifications_none?: Maybe<NotificationWhereInput>
  notificationPreferences_isNull?: Maybe<Scalars['Boolean']>
  notificationPreferences?: Maybe<AccountNotificationPreferencesWhereInput>
  referrerChannelId_isNull?: Maybe<Scalars['Boolean']>
  referrerChannelId_eq?: Maybe<Scalars['String']>
  referrerChannelId_not_eq?: Maybe<Scalars['String']>
  referrerChannelId_gt?: Maybe<Scalars['String']>
  referrerChannelId_gte?: Maybe<Scalars['String']>
  referrerChannelId_lt?: Maybe<Scalars['String']>
  referrerChannelId_lte?: Maybe<Scalars['String']>
  referrerChannelId_in?: Maybe<Array<Scalars['String']>>
  referrerChannelId_not_in?: Maybe<Array<Scalars['String']>>
  referrerChannelId_contains?: Maybe<Scalars['String']>
  referrerChannelId_not_contains?: Maybe<Scalars['String']>
  referrerChannelId_containsInsensitive?: Maybe<Scalars['String']>
  referrerChannelId_not_containsInsensitive?: Maybe<Scalars['String']>
  referrerChannelId_startsWith?: Maybe<Scalars['String']>
  referrerChannelId_not_startsWith?: Maybe<Scalars['String']>
  referrerChannelId_endsWith?: Maybe<Scalars['String']>
  referrerChannelId_not_endsWith?: Maybe<Scalars['String']>
  AND?: Maybe<Array<AccountWhereInput>>
  OR?: Maybe<Array<AccountWhereInput>>
}

export type AccountsConnection = {
  edges: Array<AccountEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type AddVideoViewResult = {
  videoId: Scalars['String']
  viewId: Scalars['String']
  viewsNum: Scalars['Int']
  added: Scalars['Boolean']
}

export type App = {
  /** Runtime entity identifier (EntityId) */
  id: Scalars['String']
  /** The name of the App */
  name: Scalars['String']
  /** Member owning the App */
  ownerMember: Membership
  /** Url where user can read more about the project or company for this app */
  websiteUrl?: Maybe<Scalars['String']>
  /** Url to the app */
  useUri?: Maybe<Scalars['String']>
  smallIcon?: Maybe<Scalars['String']>
  mediumIcon?: Maybe<Scalars['String']>
  bigIcon?: Maybe<Scalars['String']>
  /** Tagline of the app */
  oneLiner?: Maybe<Scalars['String']>
  description?: Maybe<Scalars['String']>
  termsOfService?: Maybe<Scalars['String']>
  /** List of platforms on which the app will be available, e.g. [mobile, web, native] */
  platforms?: Maybe<Array<Maybe<Scalars['String']>>>
  category?: Maybe<Scalars['String']>
  authKey?: Maybe<Scalars['String']>
  appVideos: Array<Video>
  appChannels: Array<Channel>
}

export type AppAppVideosArgs = {
  where?: Maybe<VideoWhereInput>
  orderBy?: Maybe<Array<VideoOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type AppAppChannelsArgs = {
  where?: Maybe<ChannelWhereInput>
  orderBy?: Maybe<Array<ChannelOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export enum AppActionActionType {
  CreateVideo = 'CREATE_VIDEO',
  CreateChannel = 'CREATE_CHANNEL',
}

export type AppEdge = {
  node: App
  cursor: Scalars['String']
}

export enum AppOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  NameAsc = 'name_ASC',
  NameDesc = 'name_DESC',
  OwnerMemberIdAsc = 'ownerMember_id_ASC',
  OwnerMemberIdDesc = 'ownerMember_id_DESC',
  OwnerMemberCreatedAtAsc = 'ownerMember_createdAt_ASC',
  OwnerMemberCreatedAtDesc = 'ownerMember_createdAt_DESC',
  OwnerMemberHandleAsc = 'ownerMember_handle_ASC',
  OwnerMemberHandleDesc = 'ownerMember_handle_DESC',
  OwnerMemberHandleRawAsc = 'ownerMember_handleRaw_ASC',
  OwnerMemberHandleRawDesc = 'ownerMember_handleRaw_DESC',
  OwnerMemberControllerAccountAsc = 'ownerMember_controllerAccount_ASC',
  OwnerMemberControllerAccountDesc = 'ownerMember_controllerAccount_DESC',
  OwnerMemberTotalChannelsCreatedAsc = 'ownerMember_totalChannelsCreated_ASC',
  OwnerMemberTotalChannelsCreatedDesc = 'ownerMember_totalChannelsCreated_DESC',
  WebsiteUrlAsc = 'websiteUrl_ASC',
  WebsiteUrlDesc = 'websiteUrl_DESC',
  UseUriAsc = 'useUri_ASC',
  UseUriDesc = 'useUri_DESC',
  SmallIconAsc = 'smallIcon_ASC',
  SmallIconDesc = 'smallIcon_DESC',
  MediumIconAsc = 'mediumIcon_ASC',
  MediumIconDesc = 'mediumIcon_DESC',
  BigIconAsc = 'bigIcon_ASC',
  BigIconDesc = 'bigIcon_DESC',
  OneLinerAsc = 'oneLiner_ASC',
  OneLinerDesc = 'oneLiner_DESC',
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC',
  TermsOfServiceAsc = 'termsOfService_ASC',
  TermsOfServiceDesc = 'termsOfService_DESC',
  CategoryAsc = 'category_ASC',
  CategoryDesc = 'category_DESC',
  AuthKeyAsc = 'authKey_ASC',
  AuthKeyDesc = 'authKey_DESC',
}

export type AppRootDomain = {
  isApplied: Scalars['Boolean']
}

export type AppWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  name_isNull?: Maybe<Scalars['Boolean']>
  name_eq?: Maybe<Scalars['String']>
  name_not_eq?: Maybe<Scalars['String']>
  name_gt?: Maybe<Scalars['String']>
  name_gte?: Maybe<Scalars['String']>
  name_lt?: Maybe<Scalars['String']>
  name_lte?: Maybe<Scalars['String']>
  name_in?: Maybe<Array<Scalars['String']>>
  name_not_in?: Maybe<Array<Scalars['String']>>
  name_contains?: Maybe<Scalars['String']>
  name_not_contains?: Maybe<Scalars['String']>
  name_containsInsensitive?: Maybe<Scalars['String']>
  name_not_containsInsensitive?: Maybe<Scalars['String']>
  name_startsWith?: Maybe<Scalars['String']>
  name_not_startsWith?: Maybe<Scalars['String']>
  name_endsWith?: Maybe<Scalars['String']>
  name_not_endsWith?: Maybe<Scalars['String']>
  ownerMember_isNull?: Maybe<Scalars['Boolean']>
  ownerMember?: Maybe<MembershipWhereInput>
  websiteUrl_isNull?: Maybe<Scalars['Boolean']>
  websiteUrl_eq?: Maybe<Scalars['String']>
  websiteUrl_not_eq?: Maybe<Scalars['String']>
  websiteUrl_gt?: Maybe<Scalars['String']>
  websiteUrl_gte?: Maybe<Scalars['String']>
  websiteUrl_lt?: Maybe<Scalars['String']>
  websiteUrl_lte?: Maybe<Scalars['String']>
  websiteUrl_in?: Maybe<Array<Scalars['String']>>
  websiteUrl_not_in?: Maybe<Array<Scalars['String']>>
  websiteUrl_contains?: Maybe<Scalars['String']>
  websiteUrl_not_contains?: Maybe<Scalars['String']>
  websiteUrl_containsInsensitive?: Maybe<Scalars['String']>
  websiteUrl_not_containsInsensitive?: Maybe<Scalars['String']>
  websiteUrl_startsWith?: Maybe<Scalars['String']>
  websiteUrl_not_startsWith?: Maybe<Scalars['String']>
  websiteUrl_endsWith?: Maybe<Scalars['String']>
  websiteUrl_not_endsWith?: Maybe<Scalars['String']>
  useUri_isNull?: Maybe<Scalars['Boolean']>
  useUri_eq?: Maybe<Scalars['String']>
  useUri_not_eq?: Maybe<Scalars['String']>
  useUri_gt?: Maybe<Scalars['String']>
  useUri_gte?: Maybe<Scalars['String']>
  useUri_lt?: Maybe<Scalars['String']>
  useUri_lte?: Maybe<Scalars['String']>
  useUri_in?: Maybe<Array<Scalars['String']>>
  useUri_not_in?: Maybe<Array<Scalars['String']>>
  useUri_contains?: Maybe<Scalars['String']>
  useUri_not_contains?: Maybe<Scalars['String']>
  useUri_containsInsensitive?: Maybe<Scalars['String']>
  useUri_not_containsInsensitive?: Maybe<Scalars['String']>
  useUri_startsWith?: Maybe<Scalars['String']>
  useUri_not_startsWith?: Maybe<Scalars['String']>
  useUri_endsWith?: Maybe<Scalars['String']>
  useUri_not_endsWith?: Maybe<Scalars['String']>
  smallIcon_isNull?: Maybe<Scalars['Boolean']>
  smallIcon_eq?: Maybe<Scalars['String']>
  smallIcon_not_eq?: Maybe<Scalars['String']>
  smallIcon_gt?: Maybe<Scalars['String']>
  smallIcon_gte?: Maybe<Scalars['String']>
  smallIcon_lt?: Maybe<Scalars['String']>
  smallIcon_lte?: Maybe<Scalars['String']>
  smallIcon_in?: Maybe<Array<Scalars['String']>>
  smallIcon_not_in?: Maybe<Array<Scalars['String']>>
  smallIcon_contains?: Maybe<Scalars['String']>
  smallIcon_not_contains?: Maybe<Scalars['String']>
  smallIcon_containsInsensitive?: Maybe<Scalars['String']>
  smallIcon_not_containsInsensitive?: Maybe<Scalars['String']>
  smallIcon_startsWith?: Maybe<Scalars['String']>
  smallIcon_not_startsWith?: Maybe<Scalars['String']>
  smallIcon_endsWith?: Maybe<Scalars['String']>
  smallIcon_not_endsWith?: Maybe<Scalars['String']>
  mediumIcon_isNull?: Maybe<Scalars['Boolean']>
  mediumIcon_eq?: Maybe<Scalars['String']>
  mediumIcon_not_eq?: Maybe<Scalars['String']>
  mediumIcon_gt?: Maybe<Scalars['String']>
  mediumIcon_gte?: Maybe<Scalars['String']>
  mediumIcon_lt?: Maybe<Scalars['String']>
  mediumIcon_lte?: Maybe<Scalars['String']>
  mediumIcon_in?: Maybe<Array<Scalars['String']>>
  mediumIcon_not_in?: Maybe<Array<Scalars['String']>>
  mediumIcon_contains?: Maybe<Scalars['String']>
  mediumIcon_not_contains?: Maybe<Scalars['String']>
  mediumIcon_containsInsensitive?: Maybe<Scalars['String']>
  mediumIcon_not_containsInsensitive?: Maybe<Scalars['String']>
  mediumIcon_startsWith?: Maybe<Scalars['String']>
  mediumIcon_not_startsWith?: Maybe<Scalars['String']>
  mediumIcon_endsWith?: Maybe<Scalars['String']>
  mediumIcon_not_endsWith?: Maybe<Scalars['String']>
  bigIcon_isNull?: Maybe<Scalars['Boolean']>
  bigIcon_eq?: Maybe<Scalars['String']>
  bigIcon_not_eq?: Maybe<Scalars['String']>
  bigIcon_gt?: Maybe<Scalars['String']>
  bigIcon_gte?: Maybe<Scalars['String']>
  bigIcon_lt?: Maybe<Scalars['String']>
  bigIcon_lte?: Maybe<Scalars['String']>
  bigIcon_in?: Maybe<Array<Scalars['String']>>
  bigIcon_not_in?: Maybe<Array<Scalars['String']>>
  bigIcon_contains?: Maybe<Scalars['String']>
  bigIcon_not_contains?: Maybe<Scalars['String']>
  bigIcon_containsInsensitive?: Maybe<Scalars['String']>
  bigIcon_not_containsInsensitive?: Maybe<Scalars['String']>
  bigIcon_startsWith?: Maybe<Scalars['String']>
  bigIcon_not_startsWith?: Maybe<Scalars['String']>
  bigIcon_endsWith?: Maybe<Scalars['String']>
  bigIcon_not_endsWith?: Maybe<Scalars['String']>
  oneLiner_isNull?: Maybe<Scalars['Boolean']>
  oneLiner_eq?: Maybe<Scalars['String']>
  oneLiner_not_eq?: Maybe<Scalars['String']>
  oneLiner_gt?: Maybe<Scalars['String']>
  oneLiner_gte?: Maybe<Scalars['String']>
  oneLiner_lt?: Maybe<Scalars['String']>
  oneLiner_lte?: Maybe<Scalars['String']>
  oneLiner_in?: Maybe<Array<Scalars['String']>>
  oneLiner_not_in?: Maybe<Array<Scalars['String']>>
  oneLiner_contains?: Maybe<Scalars['String']>
  oneLiner_not_contains?: Maybe<Scalars['String']>
  oneLiner_containsInsensitive?: Maybe<Scalars['String']>
  oneLiner_not_containsInsensitive?: Maybe<Scalars['String']>
  oneLiner_startsWith?: Maybe<Scalars['String']>
  oneLiner_not_startsWith?: Maybe<Scalars['String']>
  oneLiner_endsWith?: Maybe<Scalars['String']>
  oneLiner_not_endsWith?: Maybe<Scalars['String']>
  description_isNull?: Maybe<Scalars['Boolean']>
  description_eq?: Maybe<Scalars['String']>
  description_not_eq?: Maybe<Scalars['String']>
  description_gt?: Maybe<Scalars['String']>
  description_gte?: Maybe<Scalars['String']>
  description_lt?: Maybe<Scalars['String']>
  description_lte?: Maybe<Scalars['String']>
  description_in?: Maybe<Array<Scalars['String']>>
  description_not_in?: Maybe<Array<Scalars['String']>>
  description_contains?: Maybe<Scalars['String']>
  description_not_contains?: Maybe<Scalars['String']>
  description_containsInsensitive?: Maybe<Scalars['String']>
  description_not_containsInsensitive?: Maybe<Scalars['String']>
  description_startsWith?: Maybe<Scalars['String']>
  description_not_startsWith?: Maybe<Scalars['String']>
  description_endsWith?: Maybe<Scalars['String']>
  description_not_endsWith?: Maybe<Scalars['String']>
  termsOfService_isNull?: Maybe<Scalars['Boolean']>
  termsOfService_eq?: Maybe<Scalars['String']>
  termsOfService_not_eq?: Maybe<Scalars['String']>
  termsOfService_gt?: Maybe<Scalars['String']>
  termsOfService_gte?: Maybe<Scalars['String']>
  termsOfService_lt?: Maybe<Scalars['String']>
  termsOfService_lte?: Maybe<Scalars['String']>
  termsOfService_in?: Maybe<Array<Scalars['String']>>
  termsOfService_not_in?: Maybe<Array<Scalars['String']>>
  termsOfService_contains?: Maybe<Scalars['String']>
  termsOfService_not_contains?: Maybe<Scalars['String']>
  termsOfService_containsInsensitive?: Maybe<Scalars['String']>
  termsOfService_not_containsInsensitive?: Maybe<Scalars['String']>
  termsOfService_startsWith?: Maybe<Scalars['String']>
  termsOfService_not_startsWith?: Maybe<Scalars['String']>
  termsOfService_endsWith?: Maybe<Scalars['String']>
  termsOfService_not_endsWith?: Maybe<Scalars['String']>
  platforms_isNull?: Maybe<Scalars['Boolean']>
  platforms_containsAll?: Maybe<Array<Maybe<Scalars['String']>>>
  platforms_containsAny?: Maybe<Array<Maybe<Scalars['String']>>>
  platforms_containsNone?: Maybe<Array<Maybe<Scalars['String']>>>
  category_isNull?: Maybe<Scalars['Boolean']>
  category_eq?: Maybe<Scalars['String']>
  category_not_eq?: Maybe<Scalars['String']>
  category_gt?: Maybe<Scalars['String']>
  category_gte?: Maybe<Scalars['String']>
  category_lt?: Maybe<Scalars['String']>
  category_lte?: Maybe<Scalars['String']>
  category_in?: Maybe<Array<Scalars['String']>>
  category_not_in?: Maybe<Array<Scalars['String']>>
  category_contains?: Maybe<Scalars['String']>
  category_not_contains?: Maybe<Scalars['String']>
  category_containsInsensitive?: Maybe<Scalars['String']>
  category_not_containsInsensitive?: Maybe<Scalars['String']>
  category_startsWith?: Maybe<Scalars['String']>
  category_not_startsWith?: Maybe<Scalars['String']>
  category_endsWith?: Maybe<Scalars['String']>
  category_not_endsWith?: Maybe<Scalars['String']>
  authKey_isNull?: Maybe<Scalars['Boolean']>
  authKey_eq?: Maybe<Scalars['String']>
  authKey_not_eq?: Maybe<Scalars['String']>
  authKey_gt?: Maybe<Scalars['String']>
  authKey_gte?: Maybe<Scalars['String']>
  authKey_lt?: Maybe<Scalars['String']>
  authKey_lte?: Maybe<Scalars['String']>
  authKey_in?: Maybe<Array<Scalars['String']>>
  authKey_not_in?: Maybe<Array<Scalars['String']>>
  authKey_contains?: Maybe<Scalars['String']>
  authKey_not_contains?: Maybe<Scalars['String']>
  authKey_containsInsensitive?: Maybe<Scalars['String']>
  authKey_not_containsInsensitive?: Maybe<Scalars['String']>
  authKey_startsWith?: Maybe<Scalars['String']>
  authKey_not_startsWith?: Maybe<Scalars['String']>
  authKey_endsWith?: Maybe<Scalars['String']>
  authKey_not_endsWith?: Maybe<Scalars['String']>
  appVideos_every?: Maybe<VideoWhereInput>
  appVideos_some?: Maybe<VideoWhereInput>
  appVideos_none?: Maybe<VideoWhereInput>
  appChannels_every?: Maybe<ChannelWhereInput>
  appChannels_some?: Maybe<ChannelWhereInput>
  appChannels_none?: Maybe<ChannelWhereInput>
  AND?: Maybe<Array<AppWhereInput>>
  OR?: Maybe<Array<AppWhereInput>>
}

export type AppsConnection = {
  edges: Array<AppEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

/** Represents NFT auction */
export type Auction = {
  /** Unique identifier */
  id: Scalars['String']
  /** Auctioned NFT */
  nft: OwnedNft
  /** Member that won this auction */
  winningMember?: Maybe<Membership>
  /** Auction starting price */
  startingPrice: Scalars['BigInt']
  /** Price at which the auction gets completed instantly (if any) */
  buyNowPrice?: Maybe<Scalars['BigInt']>
  /** The type of auction */
  auctionType: AuctionType
  /** Auction last bid (if exists) */
  topBid?: Maybe<Bid>
  /** All bids made during this auction */
  bids: Array<Bid>
  /** Block when auction starts */
  startsAtBlock: Scalars['Int']
  /** Block when auction ended */
  endedAtBlock?: Maybe<Scalars['Int']>
  /** Is auction canceled */
  isCanceled: Scalars['Boolean']
  /** Is auction completed */
  isCompleted: Scalars['Boolean']
  /** Auction participants whitelist */
  whitelistedMembers: Array<AuctionWhitelistedMember>
}

/** Represents NFT auction */
export type AuctionBidsArgs = {
  where?: Maybe<BidWhereInput>
  orderBy?: Maybe<Array<BidOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

/** Represents NFT auction */
export type AuctionWhitelistedMembersArgs = {
  where?: Maybe<AuctionWhitelistedMemberWhereInput>
  orderBy?: Maybe<Array<AuctionWhitelistedMemberOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type AuctionBidCanceledEventData = {
  /** Member that canceled the bid. */
  member: Membership
  /** Nft owner at the time it was being auctioned. */
  nftOwner: NftOwner
  /** The bid that got canceled. */
  bid: Bid
}

export type AuctionBidMadeEventData = {
  /** The bid that was submitted */
  bid: Bid
  /** Nft owner at the time it was being auctioned. */
  nftOwner: NftOwner
}

export type AuctionCanceledEventData = {
  /** Content actor canceling the auction. */
  actor: ContentActor
  /** Nft owner at the time the auction was being auctioned. */
  nftOwner: NftOwner
  /** Auction that was canceled. */
  auction: Auction
}

export type AuctionEdge = {
  node: Auction
  cursor: Scalars['String']
}

export type AuctionLost = {
  /** Auction type */
  type: AuctionType
  /** video title for notification text */
  videoTitle: Scalars['String']
  /** video Id used for link */
  videoId: Scalars['String']
}

export enum AuctionOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  NftIdAsc = 'nft_id_ASC',
  NftIdDesc = 'nft_id_DESC',
  NftCreatedAtAsc = 'nft_createdAt_ASC',
  NftCreatedAtDesc = 'nft_createdAt_DESC',
  NftCreatorRoyaltyAsc = 'nft_creatorRoyalty_ASC',
  NftCreatorRoyaltyDesc = 'nft_creatorRoyalty_DESC',
  NftLastSalePriceAsc = 'nft_lastSalePrice_ASC',
  NftLastSalePriceDesc = 'nft_lastSalePrice_DESC',
  NftLastSaleDateAsc = 'nft_lastSaleDate_ASC',
  NftLastSaleDateDesc = 'nft_lastSaleDate_DESC',
  NftIsFeaturedAsc = 'nft_isFeatured_ASC',
  NftIsFeaturedDesc = 'nft_isFeatured_DESC',
  WinningMemberIdAsc = 'winningMember_id_ASC',
  WinningMemberIdDesc = 'winningMember_id_DESC',
  WinningMemberCreatedAtAsc = 'winningMember_createdAt_ASC',
  WinningMemberCreatedAtDesc = 'winningMember_createdAt_DESC',
  WinningMemberHandleAsc = 'winningMember_handle_ASC',
  WinningMemberHandleDesc = 'winningMember_handle_DESC',
  WinningMemberHandleRawAsc = 'winningMember_handleRaw_ASC',
  WinningMemberHandleRawDesc = 'winningMember_handleRaw_DESC',
  WinningMemberControllerAccountAsc = 'winningMember_controllerAccount_ASC',
  WinningMemberControllerAccountDesc = 'winningMember_controllerAccount_DESC',
  WinningMemberTotalChannelsCreatedAsc = 'winningMember_totalChannelsCreated_ASC',
  WinningMemberTotalChannelsCreatedDesc = 'winningMember_totalChannelsCreated_DESC',
  StartingPriceAsc = 'startingPrice_ASC',
  StartingPriceDesc = 'startingPrice_DESC',
  BuyNowPriceAsc = 'buyNowPrice_ASC',
  BuyNowPriceDesc = 'buyNowPrice_DESC',
  AuctionTypeDurationAsc = 'auctionType_duration_ASC',
  AuctionTypeDurationDesc = 'auctionType_duration_DESC',
  AuctionTypeExtensionPeriodAsc = 'auctionType_extensionPeriod_ASC',
  AuctionTypeExtensionPeriodDesc = 'auctionType_extensionPeriod_DESC',
  AuctionTypePlannedEndAtBlockAsc = 'auctionType_plannedEndAtBlock_ASC',
  AuctionTypePlannedEndAtBlockDesc = 'auctionType_plannedEndAtBlock_DESC',
  AuctionTypeMinimalBidStepAsc = 'auctionType_minimalBidStep_ASC',
  AuctionTypeMinimalBidStepDesc = 'auctionType_minimalBidStep_DESC',
  AuctionTypeBidLockDurationAsc = 'auctionType_bidLockDuration_ASC',
  AuctionTypeBidLockDurationDesc = 'auctionType_bidLockDuration_DESC',
  AuctionTypeIsTypeOfAsc = 'auctionType_isTypeOf_ASC',
  AuctionTypeIsTypeOfDesc = 'auctionType_isTypeOf_DESC',
  TopBidIdAsc = 'topBid_id_ASC',
  TopBidIdDesc = 'topBid_id_DESC',
  TopBidCreatedAtAsc = 'topBid_createdAt_ASC',
  TopBidCreatedAtDesc = 'topBid_createdAt_DESC',
  TopBidAmountAsc = 'topBid_amount_ASC',
  TopBidAmountDesc = 'topBid_amount_DESC',
  TopBidIsCanceledAsc = 'topBid_isCanceled_ASC',
  TopBidIsCanceledDesc = 'topBid_isCanceled_DESC',
  TopBidCreatedInBlockAsc = 'topBid_createdInBlock_ASC',
  TopBidCreatedInBlockDesc = 'topBid_createdInBlock_DESC',
  TopBidIndexInBlockAsc = 'topBid_indexInBlock_ASC',
  TopBidIndexInBlockDesc = 'topBid_indexInBlock_DESC',
  StartsAtBlockAsc = 'startsAtBlock_ASC',
  StartsAtBlockDesc = 'startsAtBlock_DESC',
  EndedAtBlockAsc = 'endedAtBlock_ASC',
  EndedAtBlockDesc = 'endedAtBlock_DESC',
  IsCanceledAsc = 'isCanceled_ASC',
  IsCanceledDesc = 'isCanceled_DESC',
  IsCompletedAsc = 'isCompleted_ASC',
  IsCompletedDesc = 'isCompleted_DESC',
}

/** Represents various action types */
export type AuctionType = AuctionTypeEnglish | AuctionTypeOpen

/** Represents English auction details */
export type AuctionTypeEnglish = {
  /** English auction duration in blocks */
  duration: Scalars['Int']
  /** Auction extension period in blocks */
  extensionPeriod: Scalars['Int']
  /** Block when auction is supposed to end */
  plannedEndAtBlock: Scalars['Int']
  /** Minimal step between auction bids */
  minimalBidStep: Scalars['BigInt']
}

/** Represents Open auction details */
export type AuctionTypeOpen = {
  /** Auction bid lock duration */
  bidLockDuration: Scalars['Int']
}

export type AuctionTypeWhereInput = {
  duration_isNull?: Maybe<Scalars['Boolean']>
  duration_eq?: Maybe<Scalars['Int']>
  duration_not_eq?: Maybe<Scalars['Int']>
  duration_gt?: Maybe<Scalars['Int']>
  duration_gte?: Maybe<Scalars['Int']>
  duration_lt?: Maybe<Scalars['Int']>
  duration_lte?: Maybe<Scalars['Int']>
  duration_in?: Maybe<Array<Scalars['Int']>>
  duration_not_in?: Maybe<Array<Scalars['Int']>>
  extensionPeriod_isNull?: Maybe<Scalars['Boolean']>
  extensionPeriod_eq?: Maybe<Scalars['Int']>
  extensionPeriod_not_eq?: Maybe<Scalars['Int']>
  extensionPeriod_gt?: Maybe<Scalars['Int']>
  extensionPeriod_gte?: Maybe<Scalars['Int']>
  extensionPeriod_lt?: Maybe<Scalars['Int']>
  extensionPeriod_lte?: Maybe<Scalars['Int']>
  extensionPeriod_in?: Maybe<Array<Scalars['Int']>>
  extensionPeriod_not_in?: Maybe<Array<Scalars['Int']>>
  plannedEndAtBlock_isNull?: Maybe<Scalars['Boolean']>
  plannedEndAtBlock_eq?: Maybe<Scalars['Int']>
  plannedEndAtBlock_not_eq?: Maybe<Scalars['Int']>
  plannedEndAtBlock_gt?: Maybe<Scalars['Int']>
  plannedEndAtBlock_gte?: Maybe<Scalars['Int']>
  plannedEndAtBlock_lt?: Maybe<Scalars['Int']>
  plannedEndAtBlock_lte?: Maybe<Scalars['Int']>
  plannedEndAtBlock_in?: Maybe<Array<Scalars['Int']>>
  plannedEndAtBlock_not_in?: Maybe<Array<Scalars['Int']>>
  minimalBidStep_isNull?: Maybe<Scalars['Boolean']>
  minimalBidStep_eq?: Maybe<Scalars['BigInt']>
  minimalBidStep_not_eq?: Maybe<Scalars['BigInt']>
  minimalBidStep_gt?: Maybe<Scalars['BigInt']>
  minimalBidStep_gte?: Maybe<Scalars['BigInt']>
  minimalBidStep_lt?: Maybe<Scalars['BigInt']>
  minimalBidStep_lte?: Maybe<Scalars['BigInt']>
  minimalBidStep_in?: Maybe<Array<Scalars['BigInt']>>
  minimalBidStep_not_in?: Maybe<Array<Scalars['BigInt']>>
  bidLockDuration_isNull?: Maybe<Scalars['Boolean']>
  bidLockDuration_eq?: Maybe<Scalars['Int']>
  bidLockDuration_not_eq?: Maybe<Scalars['Int']>
  bidLockDuration_gt?: Maybe<Scalars['Int']>
  bidLockDuration_gte?: Maybe<Scalars['Int']>
  bidLockDuration_lt?: Maybe<Scalars['Int']>
  bidLockDuration_lte?: Maybe<Scalars['Int']>
  bidLockDuration_in?: Maybe<Array<Scalars['Int']>>
  bidLockDuration_not_in?: Maybe<Array<Scalars['Int']>>
  isTypeOf_isNull?: Maybe<Scalars['Boolean']>
  isTypeOf_eq?: Maybe<Scalars['String']>
  isTypeOf_not_eq?: Maybe<Scalars['String']>
  isTypeOf_gt?: Maybe<Scalars['String']>
  isTypeOf_gte?: Maybe<Scalars['String']>
  isTypeOf_lt?: Maybe<Scalars['String']>
  isTypeOf_lte?: Maybe<Scalars['String']>
  isTypeOf_in?: Maybe<Array<Scalars['String']>>
  isTypeOf_not_in?: Maybe<Array<Scalars['String']>>
  isTypeOf_contains?: Maybe<Scalars['String']>
  isTypeOf_not_contains?: Maybe<Scalars['String']>
  isTypeOf_containsInsensitive?: Maybe<Scalars['String']>
  isTypeOf_not_containsInsensitive?: Maybe<Scalars['String']>
  isTypeOf_startsWith?: Maybe<Scalars['String']>
  isTypeOf_not_startsWith?: Maybe<Scalars['String']>
  isTypeOf_endsWith?: Maybe<Scalars['String']>
  isTypeOf_not_endsWith?: Maybe<Scalars['String']>
}

export type AuctionWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  nft_isNull?: Maybe<Scalars['Boolean']>
  nft?: Maybe<OwnedNftWhereInput>
  winningMember_isNull?: Maybe<Scalars['Boolean']>
  winningMember?: Maybe<MembershipWhereInput>
  startingPrice_isNull?: Maybe<Scalars['Boolean']>
  startingPrice_eq?: Maybe<Scalars['BigInt']>
  startingPrice_not_eq?: Maybe<Scalars['BigInt']>
  startingPrice_gt?: Maybe<Scalars['BigInt']>
  startingPrice_gte?: Maybe<Scalars['BigInt']>
  startingPrice_lt?: Maybe<Scalars['BigInt']>
  startingPrice_lte?: Maybe<Scalars['BigInt']>
  startingPrice_in?: Maybe<Array<Scalars['BigInt']>>
  startingPrice_not_in?: Maybe<Array<Scalars['BigInt']>>
  buyNowPrice_isNull?: Maybe<Scalars['Boolean']>
  buyNowPrice_eq?: Maybe<Scalars['BigInt']>
  buyNowPrice_not_eq?: Maybe<Scalars['BigInt']>
  buyNowPrice_gt?: Maybe<Scalars['BigInt']>
  buyNowPrice_gte?: Maybe<Scalars['BigInt']>
  buyNowPrice_lt?: Maybe<Scalars['BigInt']>
  buyNowPrice_lte?: Maybe<Scalars['BigInt']>
  buyNowPrice_in?: Maybe<Array<Scalars['BigInt']>>
  buyNowPrice_not_in?: Maybe<Array<Scalars['BigInt']>>
  auctionType_isNull?: Maybe<Scalars['Boolean']>
  auctionType?: Maybe<AuctionTypeWhereInput>
  topBid_isNull?: Maybe<Scalars['Boolean']>
  topBid?: Maybe<BidWhereInput>
  bids_every?: Maybe<BidWhereInput>
  bids_some?: Maybe<BidWhereInput>
  bids_none?: Maybe<BidWhereInput>
  startsAtBlock_isNull?: Maybe<Scalars['Boolean']>
  startsAtBlock_eq?: Maybe<Scalars['Int']>
  startsAtBlock_not_eq?: Maybe<Scalars['Int']>
  startsAtBlock_gt?: Maybe<Scalars['Int']>
  startsAtBlock_gte?: Maybe<Scalars['Int']>
  startsAtBlock_lt?: Maybe<Scalars['Int']>
  startsAtBlock_lte?: Maybe<Scalars['Int']>
  startsAtBlock_in?: Maybe<Array<Scalars['Int']>>
  startsAtBlock_not_in?: Maybe<Array<Scalars['Int']>>
  endedAtBlock_isNull?: Maybe<Scalars['Boolean']>
  endedAtBlock_eq?: Maybe<Scalars['Int']>
  endedAtBlock_not_eq?: Maybe<Scalars['Int']>
  endedAtBlock_gt?: Maybe<Scalars['Int']>
  endedAtBlock_gte?: Maybe<Scalars['Int']>
  endedAtBlock_lt?: Maybe<Scalars['Int']>
  endedAtBlock_lte?: Maybe<Scalars['Int']>
  endedAtBlock_in?: Maybe<Array<Scalars['Int']>>
  endedAtBlock_not_in?: Maybe<Array<Scalars['Int']>>
  isCanceled_isNull?: Maybe<Scalars['Boolean']>
  isCanceled_eq?: Maybe<Scalars['Boolean']>
  isCanceled_not_eq?: Maybe<Scalars['Boolean']>
  isCompleted_isNull?: Maybe<Scalars['Boolean']>
  isCompleted_eq?: Maybe<Scalars['Boolean']>
  isCompleted_not_eq?: Maybe<Scalars['Boolean']>
  whitelistedMembers_every?: Maybe<AuctionWhitelistedMemberWhereInput>
  whitelistedMembers_some?: Maybe<AuctionWhitelistedMemberWhereInput>
  whitelistedMembers_none?: Maybe<AuctionWhitelistedMemberWhereInput>
  AND?: Maybe<Array<AuctionWhereInput>>
  OR?: Maybe<Array<AuctionWhereInput>>
}

export type AuctionWhitelistedMember = {
  /** {auctionId}-{memberId} */
  id: Scalars['String']
  auction: Auction
  member: Membership
}

export type AuctionWhitelistedMemberEdge = {
  node: AuctionWhitelistedMember
  cursor: Scalars['String']
}

export enum AuctionWhitelistedMemberOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  AuctionIdAsc = 'auction_id_ASC',
  AuctionIdDesc = 'auction_id_DESC',
  AuctionStartingPriceAsc = 'auction_startingPrice_ASC',
  AuctionStartingPriceDesc = 'auction_startingPrice_DESC',
  AuctionBuyNowPriceAsc = 'auction_buyNowPrice_ASC',
  AuctionBuyNowPriceDesc = 'auction_buyNowPrice_DESC',
  AuctionStartsAtBlockAsc = 'auction_startsAtBlock_ASC',
  AuctionStartsAtBlockDesc = 'auction_startsAtBlock_DESC',
  AuctionEndedAtBlockAsc = 'auction_endedAtBlock_ASC',
  AuctionEndedAtBlockDesc = 'auction_endedAtBlock_DESC',
  AuctionIsCanceledAsc = 'auction_isCanceled_ASC',
  AuctionIsCanceledDesc = 'auction_isCanceled_DESC',
  AuctionIsCompletedAsc = 'auction_isCompleted_ASC',
  AuctionIsCompletedDesc = 'auction_isCompleted_DESC',
  MemberIdAsc = 'member_id_ASC',
  MemberIdDesc = 'member_id_DESC',
  MemberCreatedAtAsc = 'member_createdAt_ASC',
  MemberCreatedAtDesc = 'member_createdAt_DESC',
  MemberHandleAsc = 'member_handle_ASC',
  MemberHandleDesc = 'member_handle_DESC',
  MemberHandleRawAsc = 'member_handleRaw_ASC',
  MemberHandleRawDesc = 'member_handleRaw_DESC',
  MemberControllerAccountAsc = 'member_controllerAccount_ASC',
  MemberControllerAccountDesc = 'member_controllerAccount_DESC',
  MemberTotalChannelsCreatedAsc = 'member_totalChannelsCreated_ASC',
  MemberTotalChannelsCreatedDesc = 'member_totalChannelsCreated_DESC',
}

export type AuctionWhitelistedMemberWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  auction_isNull?: Maybe<Scalars['Boolean']>
  auction?: Maybe<AuctionWhereInput>
  member_isNull?: Maybe<Scalars['Boolean']>
  member?: Maybe<MembershipWhereInput>
  AND?: Maybe<Array<AuctionWhitelistedMemberWhereInput>>
  OR?: Maybe<Array<AuctionWhitelistedMemberWhereInput>>
}

export type AuctionWhitelistedMembersConnection = {
  edges: Array<AuctionWhitelistedMemberEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type AuctionWon = {
  /** Auction type */
  type: AuctionType
  /** video title for notification text */
  videoTitle: Scalars['String']
  /** video Id used for link */
  videoId: Scalars['String']
}

export type AuctionsConnection = {
  edges: Array<AuctionEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type Avatar = AvatarObject | AvatarUri

export type AvatarObject = {
  /** The avatar data object */
  avatarObject: StorageDataObject
}

export type AvatarUri = {
  /** The avatar URL */
  avatarUri: Scalars['String']
}

export type AvatarWhereInput = {
  avatarObject_isNull?: Maybe<Scalars['Boolean']>
  avatarObject?: Maybe<StorageDataObjectWhereInput>
  avatarUri_isNull?: Maybe<Scalars['Boolean']>
  avatarUri_eq?: Maybe<Scalars['String']>
  avatarUri_not_eq?: Maybe<Scalars['String']>
  avatarUri_gt?: Maybe<Scalars['String']>
  avatarUri_gte?: Maybe<Scalars['String']>
  avatarUri_lt?: Maybe<Scalars['String']>
  avatarUri_lte?: Maybe<Scalars['String']>
  avatarUri_in?: Maybe<Array<Scalars['String']>>
  avatarUri_not_in?: Maybe<Array<Scalars['String']>>
  avatarUri_contains?: Maybe<Scalars['String']>
  avatarUri_not_contains?: Maybe<Scalars['String']>
  avatarUri_containsInsensitive?: Maybe<Scalars['String']>
  avatarUri_not_containsInsensitive?: Maybe<Scalars['String']>
  avatarUri_startsWith?: Maybe<Scalars['String']>
  avatarUri_not_startsWith?: Maybe<Scalars['String']>
  avatarUri_endsWith?: Maybe<Scalars['String']>
  avatarUri_not_endsWith?: Maybe<Scalars['String']>
  isTypeOf_isNull?: Maybe<Scalars['Boolean']>
  isTypeOf_eq?: Maybe<Scalars['String']>
  isTypeOf_not_eq?: Maybe<Scalars['String']>
  isTypeOf_gt?: Maybe<Scalars['String']>
  isTypeOf_gte?: Maybe<Scalars['String']>
  isTypeOf_lt?: Maybe<Scalars['String']>
  isTypeOf_lte?: Maybe<Scalars['String']>
  isTypeOf_in?: Maybe<Array<Scalars['String']>>
  isTypeOf_not_in?: Maybe<Array<Scalars['String']>>
  isTypeOf_contains?: Maybe<Scalars['String']>
  isTypeOf_not_contains?: Maybe<Scalars['String']>
  isTypeOf_containsInsensitive?: Maybe<Scalars['String']>
  isTypeOf_not_containsInsensitive?: Maybe<Scalars['String']>
  isTypeOf_startsWith?: Maybe<Scalars['String']>
  isTypeOf_not_startsWith?: Maybe<Scalars['String']>
  isTypeOf_endsWith?: Maybe<Scalars['String']>
  isTypeOf_not_endsWith?: Maybe<Scalars['String']>
}

export type BannedMember = {
  /** {memberId}-{channelId} */
  id: Scalars['String']
  member: Membership
  channel: Channel
}

export type BannedMemberEdge = {
  node: BannedMember
  cursor: Scalars['String']
}

export enum BannedMemberOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  MemberIdAsc = 'member_id_ASC',
  MemberIdDesc = 'member_id_DESC',
  MemberCreatedAtAsc = 'member_createdAt_ASC',
  MemberCreatedAtDesc = 'member_createdAt_DESC',
  MemberHandleAsc = 'member_handle_ASC',
  MemberHandleDesc = 'member_handle_DESC',
  MemberHandleRawAsc = 'member_handleRaw_ASC',
  MemberHandleRawDesc = 'member_handleRaw_DESC',
  MemberControllerAccountAsc = 'member_controllerAccount_ASC',
  MemberControllerAccountDesc = 'member_controllerAccount_DESC',
  MemberTotalChannelsCreatedAsc = 'member_totalChannelsCreated_ASC',
  MemberTotalChannelsCreatedDesc = 'member_totalChannelsCreated_DESC',
  ChannelIdAsc = 'channel_id_ASC',
  ChannelIdDesc = 'channel_id_DESC',
  ChannelCreatedAtAsc = 'channel_createdAt_ASC',
  ChannelCreatedAtDesc = 'channel_createdAt_DESC',
  ChannelTitleAsc = 'channel_title_ASC',
  ChannelTitleDesc = 'channel_title_DESC',
  ChannelDescriptionAsc = 'channel_description_ASC',
  ChannelDescriptionDesc = 'channel_description_DESC',
  ChannelIsPublicAsc = 'channel_isPublic_ASC',
  ChannelIsPublicDesc = 'channel_isPublic_DESC',
  ChannelIsCensoredAsc = 'channel_isCensored_ASC',
  ChannelIsCensoredDesc = 'channel_isCensored_DESC',
  ChannelIsExcludedAsc = 'channel_isExcluded_ASC',
  ChannelIsExcludedDesc = 'channel_isExcluded_DESC',
  ChannelLanguageAsc = 'channel_language_ASC',
  ChannelLanguageDesc = 'channel_language_DESC',
  ChannelCreatedInBlockAsc = 'channel_createdInBlock_ASC',
  ChannelCreatedInBlockDesc = 'channel_createdInBlock_DESC',
  ChannelRewardAccountAsc = 'channel_rewardAccount_ASC',
  ChannelRewardAccountDesc = 'channel_rewardAccount_DESC',
  ChannelChannelStateBloatBondAsc = 'channel_channelStateBloatBond_ASC',
  ChannelChannelStateBloatBondDesc = 'channel_channelStateBloatBond_DESC',
  ChannelFollowsNumAsc = 'channel_followsNum_ASC',
  ChannelFollowsNumDesc = 'channel_followsNum_DESC',
  ChannelVideoViewsNumAsc = 'channel_videoViewsNum_ASC',
  ChannelVideoViewsNumDesc = 'channel_videoViewsNum_DESC',
  ChannelTotalVideosCreatedAsc = 'channel_totalVideosCreated_ASC',
  ChannelTotalVideosCreatedDesc = 'channel_totalVideosCreated_DESC',
  ChannelCumulativeRewardClaimedAsc = 'channel_cumulativeRewardClaimed_ASC',
  ChannelCumulativeRewardClaimedDesc = 'channel_cumulativeRewardClaimed_DESC',
  ChannelCumulativeRewardAsc = 'channel_cumulativeReward_ASC',
  ChannelCumulativeRewardDesc = 'channel_cumulativeReward_DESC',
  ChannelChannelWeightAsc = 'channel_channelWeight_ASC',
  ChannelChannelWeightDesc = 'channel_channelWeight_DESC',
}

export type BannedMemberWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  member_isNull?: Maybe<Scalars['Boolean']>
  member?: Maybe<MembershipWhereInput>
  channel_isNull?: Maybe<Scalars['Boolean']>
  channel?: Maybe<ChannelWhereInput>
  AND?: Maybe<Array<BannedMemberWhereInput>>
  OR?: Maybe<Array<BannedMemberWhereInput>>
}

export type BannedMembersConnection = {
  edges: Array<BannedMemberEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

/** Represents bid in NFT auction */
export type Bid = {
  /** Unique identifier */
  id: Scalars['String']
  /** Timestamp of the block the bid was created at */
  createdAt: Scalars['DateTime']
  /** NFT's auction */
  auction: Auction
  /** Bid's NFT */
  nft: OwnedNft
  /** Bidder membership */
  bidder: Membership
  /** Amount bidded */
  amount: Scalars['BigInt']
  /** Sign for canceled bid */
  isCanceled: Scalars['Boolean']
  /** Block in which the bid was placed */
  createdInBlock: Scalars['Int']
  /** Index in block of the related AuctionBidMade event */
  indexInBlock: Scalars['Int']
  /** Bid that was displaced by this bid in the English auction (if any) */
  previousTopBid?: Maybe<Bid>
}

export type BidEdge = {
  node: Bid
  cursor: Scalars['String']
}

export type BidMadeCompletingAuctionEventData = {
  /** Bid that completed the auction */
  winningBid: Bid
  /** NFT owner before the auction was completed */
  previousNftOwner: NftOwner
}

export enum BidOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  CreatedAtAsc = 'createdAt_ASC',
  CreatedAtDesc = 'createdAt_DESC',
  AuctionIdAsc = 'auction_id_ASC',
  AuctionIdDesc = 'auction_id_DESC',
  AuctionStartingPriceAsc = 'auction_startingPrice_ASC',
  AuctionStartingPriceDesc = 'auction_startingPrice_DESC',
  AuctionBuyNowPriceAsc = 'auction_buyNowPrice_ASC',
  AuctionBuyNowPriceDesc = 'auction_buyNowPrice_DESC',
  AuctionStartsAtBlockAsc = 'auction_startsAtBlock_ASC',
  AuctionStartsAtBlockDesc = 'auction_startsAtBlock_DESC',
  AuctionEndedAtBlockAsc = 'auction_endedAtBlock_ASC',
  AuctionEndedAtBlockDesc = 'auction_endedAtBlock_DESC',
  AuctionIsCanceledAsc = 'auction_isCanceled_ASC',
  AuctionIsCanceledDesc = 'auction_isCanceled_DESC',
  AuctionIsCompletedAsc = 'auction_isCompleted_ASC',
  AuctionIsCompletedDesc = 'auction_isCompleted_DESC',
  NftIdAsc = 'nft_id_ASC',
  NftIdDesc = 'nft_id_DESC',
  NftCreatedAtAsc = 'nft_createdAt_ASC',
  NftCreatedAtDesc = 'nft_createdAt_DESC',
  NftCreatorRoyaltyAsc = 'nft_creatorRoyalty_ASC',
  NftCreatorRoyaltyDesc = 'nft_creatorRoyalty_DESC',
  NftLastSalePriceAsc = 'nft_lastSalePrice_ASC',
  NftLastSalePriceDesc = 'nft_lastSalePrice_DESC',
  NftLastSaleDateAsc = 'nft_lastSaleDate_ASC',
  NftLastSaleDateDesc = 'nft_lastSaleDate_DESC',
  NftIsFeaturedAsc = 'nft_isFeatured_ASC',
  NftIsFeaturedDesc = 'nft_isFeatured_DESC',
  BidderIdAsc = 'bidder_id_ASC',
  BidderIdDesc = 'bidder_id_DESC',
  BidderCreatedAtAsc = 'bidder_createdAt_ASC',
  BidderCreatedAtDesc = 'bidder_createdAt_DESC',
  BidderHandleAsc = 'bidder_handle_ASC',
  BidderHandleDesc = 'bidder_handle_DESC',
  BidderHandleRawAsc = 'bidder_handleRaw_ASC',
  BidderHandleRawDesc = 'bidder_handleRaw_DESC',
  BidderControllerAccountAsc = 'bidder_controllerAccount_ASC',
  BidderControllerAccountDesc = 'bidder_controllerAccount_DESC',
  BidderTotalChannelsCreatedAsc = 'bidder_totalChannelsCreated_ASC',
  BidderTotalChannelsCreatedDesc = 'bidder_totalChannelsCreated_DESC',
  AmountAsc = 'amount_ASC',
  AmountDesc = 'amount_DESC',
  IsCanceledAsc = 'isCanceled_ASC',
  IsCanceledDesc = 'isCanceled_DESC',
  CreatedInBlockAsc = 'createdInBlock_ASC',
  CreatedInBlockDesc = 'createdInBlock_DESC',
  IndexInBlockAsc = 'indexInBlock_ASC',
  IndexInBlockDesc = 'indexInBlock_DESC',
  PreviousTopBidIdAsc = 'previousTopBid_id_ASC',
  PreviousTopBidIdDesc = 'previousTopBid_id_DESC',
  PreviousTopBidCreatedAtAsc = 'previousTopBid_createdAt_ASC',
  PreviousTopBidCreatedAtDesc = 'previousTopBid_createdAt_DESC',
  PreviousTopBidAmountAsc = 'previousTopBid_amount_ASC',
  PreviousTopBidAmountDesc = 'previousTopBid_amount_DESC',
  PreviousTopBidIsCanceledAsc = 'previousTopBid_isCanceled_ASC',
  PreviousTopBidIsCanceledDesc = 'previousTopBid_isCanceled_DESC',
  PreviousTopBidCreatedInBlockAsc = 'previousTopBid_createdInBlock_ASC',
  PreviousTopBidCreatedInBlockDesc = 'previousTopBid_createdInBlock_DESC',
  PreviousTopBidIndexInBlockAsc = 'previousTopBid_indexInBlock_ASC',
  PreviousTopBidIndexInBlockDesc = 'previousTopBid_indexInBlock_DESC',
}

export type BidWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  createdAt_isNull?: Maybe<Scalars['Boolean']>
  createdAt_eq?: Maybe<Scalars['DateTime']>
  createdAt_not_eq?: Maybe<Scalars['DateTime']>
  createdAt_gt?: Maybe<Scalars['DateTime']>
  createdAt_gte?: Maybe<Scalars['DateTime']>
  createdAt_lt?: Maybe<Scalars['DateTime']>
  createdAt_lte?: Maybe<Scalars['DateTime']>
  createdAt_in?: Maybe<Array<Scalars['DateTime']>>
  createdAt_not_in?: Maybe<Array<Scalars['DateTime']>>
  auction_isNull?: Maybe<Scalars['Boolean']>
  auction?: Maybe<AuctionWhereInput>
  nft_isNull?: Maybe<Scalars['Boolean']>
  nft?: Maybe<OwnedNftWhereInput>
  bidder_isNull?: Maybe<Scalars['Boolean']>
  bidder?: Maybe<MembershipWhereInput>
  amount_isNull?: Maybe<Scalars['Boolean']>
  amount_eq?: Maybe<Scalars['BigInt']>
  amount_not_eq?: Maybe<Scalars['BigInt']>
  amount_gt?: Maybe<Scalars['BigInt']>
  amount_gte?: Maybe<Scalars['BigInt']>
  amount_lt?: Maybe<Scalars['BigInt']>
  amount_lte?: Maybe<Scalars['BigInt']>
  amount_in?: Maybe<Array<Scalars['BigInt']>>
  amount_not_in?: Maybe<Array<Scalars['BigInt']>>
  isCanceled_isNull?: Maybe<Scalars['Boolean']>
  isCanceled_eq?: Maybe<Scalars['Boolean']>
  isCanceled_not_eq?: Maybe<Scalars['Boolean']>
  createdInBlock_isNull?: Maybe<Scalars['Boolean']>
  createdInBlock_eq?: Maybe<Scalars['Int']>
  createdInBlock_not_eq?: Maybe<Scalars['Int']>
  createdInBlock_gt?: Maybe<Scalars['Int']>
  createdInBlock_gte?: Maybe<Scalars['Int']>
  createdInBlock_lt?: Maybe<Scalars['Int']>
  createdInBlock_lte?: Maybe<Scalars['Int']>
  createdInBlock_in?: Maybe<Array<Scalars['Int']>>
  createdInBlock_not_in?: Maybe<Array<Scalars['Int']>>
  indexInBlock_isNull?: Maybe<Scalars['Boolean']>
  indexInBlock_eq?: Maybe<Scalars['Int']>
  indexInBlock_not_eq?: Maybe<Scalars['Int']>
  indexInBlock_gt?: Maybe<Scalars['Int']>
  indexInBlock_gte?: Maybe<Scalars['Int']>
  indexInBlock_lt?: Maybe<Scalars['Int']>
  indexInBlock_lte?: Maybe<Scalars['Int']>
  indexInBlock_in?: Maybe<Array<Scalars['Int']>>
  indexInBlock_not_in?: Maybe<Array<Scalars['Int']>>
  previousTopBid_isNull?: Maybe<Scalars['Boolean']>
  previousTopBid?: Maybe<BidWhereInput>
  AND?: Maybe<Array<BidWhereInput>>
  OR?: Maybe<Array<BidWhereInput>>
}

export type BidsConnection = {
  edges: Array<BidEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type BuyNowCanceledEventData = {
  /** The NFT for which the buy now offer was canceled */
  nft: OwnedNft
  /** Content actor acting as NFT owner. */
  actor: ContentActor
  /** Owner of the NFT at the time the buy now offer was canceled. */
  nftOwner: NftOwner
}

export type BuyNowPriceUpdatedEventData = {
  /** NFT being sold */
  nft: OwnedNft
  /** Content actor acting as NFT owner. */
  actor: ContentActor
  /** NFT owner at the time it was on sale */
  nftOwner: NftOwner
  /** New sell order price. */
  newPrice: Scalars['BigInt']
}

export type Channel = {
  /** Runtime entity identifier (EntityId) */
  id: Scalars['String']
  /** Timestamp of the block the channel was created at */
  createdAt: Scalars['DateTime']
  /** Current member-owner of the channel (if owned by a member) */
  ownerMember?: Maybe<Membership>
  /** The title of the Channel */
  title?: Maybe<Scalars['String']>
  /** The description of a Channel */
  description?: Maybe<Scalars['String']>
  /** Channel's cover (background) photo asset. Recommended ratio: 16:9. */
  coverPhoto?: Maybe<StorageDataObject>
  /** Channel's avatar photo asset. */
  avatarPhoto?: Maybe<StorageDataObject>
  /** Flag signaling whether a channel is public. */
  isPublic?: Maybe<Scalars['Boolean']>
  /** Flag signaling whether a channel is censored. */
  isCensored: Scalars['Boolean']
  /** Whether a channel has been excluded/hidden (by the gateway operator) */
  isExcluded: Scalars['Boolean']
  /** The primary langauge of the channel's content */
  language?: Maybe<Scalars['String']>
  /** List of videos that belong to the channel */
  videos: Array<Video>
  /** Number of the block the channel was created in */
  createdInBlock: Scalars['Int']
  /** Channel's reward account, storing the income from the nft sales and channel payouts. */
  rewardAccount: Scalars['String']
  /** Value of channel state bloat bond fee paid by channel creator */
  channelStateBloatBond: Scalars['BigInt']
  /** Number of active follows (to speed up orderBy queries by avoiding COUNT aggregation) */
  followsNum: Scalars['Int']
  /** Number of total video views (to speed up orderBy queries by avoiding COUNT aggregation) */
  videoViewsNum: Scalars['Int']
  /** List of members blocked from commenting/reacting on any video of the channel. */
  bannedMembers: Array<BannedMember>
  /** Application used for channel creation */
  entryApp?: Maybe<App>
  /** Number of videos ever created in this channel */
  totalVideosCreated: Scalars['Int']
  /** Cumulative rewards claimed by this channel */
  cumulativeRewardClaimed: Scalars['BigInt']
  /** Cumulative rewards paid to this channel */
  cumulativeReward: Scalars['BigInt']
  /** Weight/Bias of the channel affecting video relevance in the Homepage */
  channelWeight?: Maybe<Scalars['Float']>
  /** Channel Ypp Status: either unverified , verified or suspended */
  yppStatus: ChannelYppStatus
}

export type ChannelVideosArgs = {
  where?: Maybe<VideoWhereInput>
  orderBy?: Maybe<Array<VideoOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type ChannelBannedMembersArgs = {
  where?: Maybe<BannedMemberWhereInput>
  orderBy?: Maybe<Array<BannedMemberOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type ChannelCreated = {
  /** id for link construction */
  channelId: Scalars['String']
  /** title for link construction */
  channelTitle: Scalars['String']
}

export type ChannelCreatedEventData = {
  /** channel just created */
  channel: Channel
}

export type ChannelEdge = {
  node: Channel
  cursor: Scalars['String']
}

export type ChannelExcluded = {
  /** title for the channel used for notification text */
  channelTitle: Scalars['String']
}

export type ChannelFollow = {
  /** Unique identifier of the follow */
  id: Scalars['String']
  /** User that followed the channel */
  user: User
  /** ID of the channel being followed (the channel may no longer exist) */
  channelId: Scalars['String']
  /** Time when user started following the channel */
  timestamp: Scalars['DateTime']
}

export type ChannelFollowEdge = {
  node: ChannelFollow
  cursor: Scalars['String']
}

export enum ChannelFollowOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  UserIdAsc = 'user_id_ASC',
  UserIdDesc = 'user_id_DESC',
  UserIsRootAsc = 'user_isRoot_ASC',
  UserIsRootDesc = 'user_isRoot_DESC',
  ChannelIdAsc = 'channelId_ASC',
  ChannelIdDesc = 'channelId_DESC',
  TimestampAsc = 'timestamp_ASC',
  TimestampDesc = 'timestamp_DESC',
}

export type ChannelFollowResult = {
  followId: Scalars['String']
  channelId: Scalars['String']
  follows: Scalars['Int']
  added: Scalars['Boolean']
}

export type ChannelFollowWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  user_isNull?: Maybe<Scalars['Boolean']>
  user?: Maybe<UserWhereInput>
  channelId_isNull?: Maybe<Scalars['Boolean']>
  channelId_eq?: Maybe<Scalars['String']>
  channelId_not_eq?: Maybe<Scalars['String']>
  channelId_gt?: Maybe<Scalars['String']>
  channelId_gte?: Maybe<Scalars['String']>
  channelId_lt?: Maybe<Scalars['String']>
  channelId_lte?: Maybe<Scalars['String']>
  channelId_in?: Maybe<Array<Scalars['String']>>
  channelId_not_in?: Maybe<Array<Scalars['String']>>
  channelId_contains?: Maybe<Scalars['String']>
  channelId_not_contains?: Maybe<Scalars['String']>
  channelId_containsInsensitive?: Maybe<Scalars['String']>
  channelId_not_containsInsensitive?: Maybe<Scalars['String']>
  channelId_startsWith?: Maybe<Scalars['String']>
  channelId_not_startsWith?: Maybe<Scalars['String']>
  channelId_endsWith?: Maybe<Scalars['String']>
  channelId_not_endsWith?: Maybe<Scalars['String']>
  timestamp_isNull?: Maybe<Scalars['Boolean']>
  timestamp_eq?: Maybe<Scalars['DateTime']>
  timestamp_not_eq?: Maybe<Scalars['DateTime']>
  timestamp_gt?: Maybe<Scalars['DateTime']>
  timestamp_gte?: Maybe<Scalars['DateTime']>
  timestamp_lt?: Maybe<Scalars['DateTime']>
  timestamp_lte?: Maybe<Scalars['DateTime']>
  timestamp_in?: Maybe<Array<Scalars['DateTime']>>
  timestamp_not_in?: Maybe<Array<Scalars['DateTime']>>
  AND?: Maybe<Array<ChannelFollowWhereInput>>
  OR?: Maybe<Array<ChannelFollowWhereInput>>
}

export type ChannelFollowsConnection = {
  edges: Array<ChannelFollowEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type ChannelFundsWithdrawn = {
  /** amount */
  amount: Scalars['BigInt']
}

export type ChannelFundsWithdrawnEventData = {
  /** The channel that claimed the reward */
  channel: Channel
  /** Reward amount claimed */
  amount: Scalars['BigInt']
  /** Destination account ID. Null if claimed by curators' channel (paid to council budget in this case) */
  account?: Maybe<Scalars['String']>
  /** Content actor */
  actor: ContentActor
}

export type ChannelNftCollector = {
  member: Membership
  amount: Scalars['Int']
}

export enum ChannelNftCollectorsOrderByInput {
  AmountAsc = 'amount_ASC',
  AmountDesc = 'amount_DESC',
}

export enum ChannelOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  CreatedAtAsc = 'createdAt_ASC',
  CreatedAtDesc = 'createdAt_DESC',
  OwnerMemberIdAsc = 'ownerMember_id_ASC',
  OwnerMemberIdDesc = 'ownerMember_id_DESC',
  OwnerMemberCreatedAtAsc = 'ownerMember_createdAt_ASC',
  OwnerMemberCreatedAtDesc = 'ownerMember_createdAt_DESC',
  OwnerMemberHandleAsc = 'ownerMember_handle_ASC',
  OwnerMemberHandleDesc = 'ownerMember_handle_DESC',
  OwnerMemberHandleRawAsc = 'ownerMember_handleRaw_ASC',
  OwnerMemberHandleRawDesc = 'ownerMember_handleRaw_DESC',
  OwnerMemberControllerAccountAsc = 'ownerMember_controllerAccount_ASC',
  OwnerMemberControllerAccountDesc = 'ownerMember_controllerAccount_DESC',
  OwnerMemberTotalChannelsCreatedAsc = 'ownerMember_totalChannelsCreated_ASC',
  OwnerMemberTotalChannelsCreatedDesc = 'ownerMember_totalChannelsCreated_DESC',
  TitleAsc = 'title_ASC',
  TitleDesc = 'title_DESC',
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC',
  CoverPhotoIdAsc = 'coverPhoto_id_ASC',
  CoverPhotoIdDesc = 'coverPhoto_id_DESC',
  CoverPhotoCreatedAtAsc = 'coverPhoto_createdAt_ASC',
  CoverPhotoCreatedAtDesc = 'coverPhoto_createdAt_DESC',
  CoverPhotoIsAcceptedAsc = 'coverPhoto_isAccepted_ASC',
  CoverPhotoIsAcceptedDesc = 'coverPhoto_isAccepted_DESC',
  CoverPhotoSizeAsc = 'coverPhoto_size_ASC',
  CoverPhotoSizeDesc = 'coverPhoto_size_DESC',
  CoverPhotoIpfsHashAsc = 'coverPhoto_ipfsHash_ASC',
  CoverPhotoIpfsHashDesc = 'coverPhoto_ipfsHash_DESC',
  CoverPhotoStateBloatBondAsc = 'coverPhoto_stateBloatBond_ASC',
  CoverPhotoStateBloatBondDesc = 'coverPhoto_stateBloatBond_DESC',
  CoverPhotoUnsetAtAsc = 'coverPhoto_unsetAt_ASC',
  CoverPhotoUnsetAtDesc = 'coverPhoto_unsetAt_DESC',
  AvatarPhotoIdAsc = 'avatarPhoto_id_ASC',
  AvatarPhotoIdDesc = 'avatarPhoto_id_DESC',
  AvatarPhotoCreatedAtAsc = 'avatarPhoto_createdAt_ASC',
  AvatarPhotoCreatedAtDesc = 'avatarPhoto_createdAt_DESC',
  AvatarPhotoIsAcceptedAsc = 'avatarPhoto_isAccepted_ASC',
  AvatarPhotoIsAcceptedDesc = 'avatarPhoto_isAccepted_DESC',
  AvatarPhotoSizeAsc = 'avatarPhoto_size_ASC',
  AvatarPhotoSizeDesc = 'avatarPhoto_size_DESC',
  AvatarPhotoIpfsHashAsc = 'avatarPhoto_ipfsHash_ASC',
  AvatarPhotoIpfsHashDesc = 'avatarPhoto_ipfsHash_DESC',
  AvatarPhotoStateBloatBondAsc = 'avatarPhoto_stateBloatBond_ASC',
  AvatarPhotoStateBloatBondDesc = 'avatarPhoto_stateBloatBond_DESC',
  AvatarPhotoUnsetAtAsc = 'avatarPhoto_unsetAt_ASC',
  AvatarPhotoUnsetAtDesc = 'avatarPhoto_unsetAt_DESC',
  IsPublicAsc = 'isPublic_ASC',
  IsPublicDesc = 'isPublic_DESC',
  IsCensoredAsc = 'isCensored_ASC',
  IsCensoredDesc = 'isCensored_DESC',
  IsExcludedAsc = 'isExcluded_ASC',
  IsExcludedDesc = 'isExcluded_DESC',
  LanguageAsc = 'language_ASC',
  LanguageDesc = 'language_DESC',
  CreatedInBlockAsc = 'createdInBlock_ASC',
  CreatedInBlockDesc = 'createdInBlock_DESC',
  RewardAccountAsc = 'rewardAccount_ASC',
  RewardAccountDesc = 'rewardAccount_DESC',
  ChannelStateBloatBondAsc = 'channelStateBloatBond_ASC',
  ChannelStateBloatBondDesc = 'channelStateBloatBond_DESC',
  FollowsNumAsc = 'followsNum_ASC',
  FollowsNumDesc = 'followsNum_DESC',
  VideoViewsNumAsc = 'videoViewsNum_ASC',
  VideoViewsNumDesc = 'videoViewsNum_DESC',
  EntryAppIdAsc = 'entryApp_id_ASC',
  EntryAppIdDesc = 'entryApp_id_DESC',
  EntryAppNameAsc = 'entryApp_name_ASC',
  EntryAppNameDesc = 'entryApp_name_DESC',
  EntryAppWebsiteUrlAsc = 'entryApp_websiteUrl_ASC',
  EntryAppWebsiteUrlDesc = 'entryApp_websiteUrl_DESC',
  EntryAppUseUriAsc = 'entryApp_useUri_ASC',
  EntryAppUseUriDesc = 'entryApp_useUri_DESC',
  EntryAppSmallIconAsc = 'entryApp_smallIcon_ASC',
  EntryAppSmallIconDesc = 'entryApp_smallIcon_DESC',
  EntryAppMediumIconAsc = 'entryApp_mediumIcon_ASC',
  EntryAppMediumIconDesc = 'entryApp_mediumIcon_DESC',
  EntryAppBigIconAsc = 'entryApp_bigIcon_ASC',
  EntryAppBigIconDesc = 'entryApp_bigIcon_DESC',
  EntryAppOneLinerAsc = 'entryApp_oneLiner_ASC',
  EntryAppOneLinerDesc = 'entryApp_oneLiner_DESC',
  EntryAppDescriptionAsc = 'entryApp_description_ASC',
  EntryAppDescriptionDesc = 'entryApp_description_DESC',
  EntryAppTermsOfServiceAsc = 'entryApp_termsOfService_ASC',
  EntryAppTermsOfServiceDesc = 'entryApp_termsOfService_DESC',
  EntryAppCategoryAsc = 'entryApp_category_ASC',
  EntryAppCategoryDesc = 'entryApp_category_DESC',
  EntryAppAuthKeyAsc = 'entryApp_authKey_ASC',
  EntryAppAuthKeyDesc = 'entryApp_authKey_DESC',
  TotalVideosCreatedAsc = 'totalVideosCreated_ASC',
  TotalVideosCreatedDesc = 'totalVideosCreated_DESC',
  CumulativeRewardClaimedAsc = 'cumulativeRewardClaimed_ASC',
  CumulativeRewardClaimedDesc = 'cumulativeRewardClaimed_DESC',
  CumulativeRewardAsc = 'cumulativeReward_ASC',
  CumulativeRewardDesc = 'cumulativeReward_DESC',
  ChannelWeightAsc = 'channelWeight_ASC',
  ChannelWeightDesc = 'channelWeight_DESC',
  YppStatusPhantomAsc = 'yppStatus_phantom_ASC',
  YppStatusPhantomDesc = 'yppStatus_phantom_DESC',
  YppStatusIsTypeOfAsc = 'yppStatus_isTypeOf_ASC',
  YppStatusIsTypeOfDesc = 'yppStatus_isTypeOf_DESC',
}

/** Direct channel payment by any member by-passing the council payouts */
export type ChannelPaymentMadeEventData = {
  /** Actor that made the payment */
  payer: Membership
  /** Amount of the payment */
  amount: Scalars['BigInt']
  /** Payment and payee context */
  paymentContext?: Maybe<PaymentContext>
  /** Channel that received the payment (if any) */
  payeeChannel?: Maybe<Channel>
  /** Reason of the payment */
  rationale?: Maybe<Scalars['String']>
}

export type ChannelPayoutsUpdatedEventData = {
  /** Merkle root of the channel payouts */
  commitment?: Maybe<Scalars['String']>
  /** Storage data object corresponding to the channel payouts payload */
  payloadDataObject?: Maybe<StorageDataObject>
  /** Minimum amount of channel reward cashout allowed at a time */
  minCashoutAllowed?: Maybe<Scalars['BigInt']>
  /** Maximum amount of channel reward cashout allowed at a time */
  maxCashoutAllowed?: Maybe<Scalars['BigInt']>
  /** Can channel cashout the rewards */
  channelCashoutsEnabled?: Maybe<Scalars['Boolean']>
}

export type ChannelRecipient = {
  /** channel */
  channel: Channel
}

export type ChannelReportInfo = {
  id: Scalars['String']
  rationale: Scalars['String']
  createdAt: Scalars['DateTime']
  created: Scalars['Boolean']
  channelId: Scalars['String']
}

export type ChannelRewardClaimedAndWithdrawnEventData = {
  /** The channel that claimed the reward */
  channel: Channel
  /** Reward amount claimed */
  amount: Scalars['BigInt']
  /** Destination account ID. Null if claimed by curators' channel (paid to council budget in this case) */
  account?: Maybe<Scalars['String']>
  /** Content actor */
  actor: ContentActor
}

export type ChannelRewardClaimedEventData = {
  /** The channel that claimed the reward */
  channel: Channel
  /** Reward amount claimed */
  amount: Scalars['BigInt']
}

export type ChannelSuspended = {
  phantom?: Maybe<Scalars['Int']>
}

export type ChannelSuspension = {
  /** unique Id */
  id: Scalars['String']
  /** channel suspended */
  channel: Channel
  /** timestamp of suspension */
  timestamp: Scalars['DateTime']
}

export type ChannelSuspensionEdge = {
  node: ChannelSuspension
  cursor: Scalars['String']
}

export enum ChannelSuspensionOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  ChannelIdAsc = 'channel_id_ASC',
  ChannelIdDesc = 'channel_id_DESC',
  ChannelCreatedAtAsc = 'channel_createdAt_ASC',
  ChannelCreatedAtDesc = 'channel_createdAt_DESC',
  ChannelTitleAsc = 'channel_title_ASC',
  ChannelTitleDesc = 'channel_title_DESC',
  ChannelDescriptionAsc = 'channel_description_ASC',
  ChannelDescriptionDesc = 'channel_description_DESC',
  ChannelIsPublicAsc = 'channel_isPublic_ASC',
  ChannelIsPublicDesc = 'channel_isPublic_DESC',
  ChannelIsCensoredAsc = 'channel_isCensored_ASC',
  ChannelIsCensoredDesc = 'channel_isCensored_DESC',
  ChannelIsExcludedAsc = 'channel_isExcluded_ASC',
  ChannelIsExcludedDesc = 'channel_isExcluded_DESC',
  ChannelLanguageAsc = 'channel_language_ASC',
  ChannelLanguageDesc = 'channel_language_DESC',
  ChannelCreatedInBlockAsc = 'channel_createdInBlock_ASC',
  ChannelCreatedInBlockDesc = 'channel_createdInBlock_DESC',
  ChannelRewardAccountAsc = 'channel_rewardAccount_ASC',
  ChannelRewardAccountDesc = 'channel_rewardAccount_DESC',
  ChannelChannelStateBloatBondAsc = 'channel_channelStateBloatBond_ASC',
  ChannelChannelStateBloatBondDesc = 'channel_channelStateBloatBond_DESC',
  ChannelFollowsNumAsc = 'channel_followsNum_ASC',
  ChannelFollowsNumDesc = 'channel_followsNum_DESC',
  ChannelVideoViewsNumAsc = 'channel_videoViewsNum_ASC',
  ChannelVideoViewsNumDesc = 'channel_videoViewsNum_DESC',
  ChannelTotalVideosCreatedAsc = 'channel_totalVideosCreated_ASC',
  ChannelTotalVideosCreatedDesc = 'channel_totalVideosCreated_DESC',
  ChannelCumulativeRewardClaimedAsc = 'channel_cumulativeRewardClaimed_ASC',
  ChannelCumulativeRewardClaimedDesc = 'channel_cumulativeRewardClaimed_DESC',
  ChannelCumulativeRewardAsc = 'channel_cumulativeReward_ASC',
  ChannelCumulativeRewardDesc = 'channel_cumulativeReward_DESC',
  ChannelChannelWeightAsc = 'channel_channelWeight_ASC',
  ChannelChannelWeightDesc = 'channel_channelWeight_DESC',
  TimestampAsc = 'timestamp_ASC',
  TimestampDesc = 'timestamp_DESC',
}

export type ChannelSuspensionWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  channel_isNull?: Maybe<Scalars['Boolean']>
  channel?: Maybe<ChannelWhereInput>
  timestamp_isNull?: Maybe<Scalars['Boolean']>
  timestamp_eq?: Maybe<Scalars['DateTime']>
  timestamp_not_eq?: Maybe<Scalars['DateTime']>
  timestamp_gt?: Maybe<Scalars['DateTime']>
  timestamp_gte?: Maybe<Scalars['DateTime']>
  timestamp_lt?: Maybe<Scalars['DateTime']>
  timestamp_lte?: Maybe<Scalars['DateTime']>
  timestamp_in?: Maybe<Array<Scalars['DateTime']>>
  timestamp_not_in?: Maybe<Array<Scalars['DateTime']>>
  AND?: Maybe<Array<ChannelSuspensionWhereInput>>
  OR?: Maybe<Array<ChannelSuspensionWhereInput>>
}

export type ChannelSuspensionsConnection = {
  edges: Array<ChannelSuspensionEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type ChannelUnfollowResult = {
  channelId: Scalars['String']
  follows: Scalars['Int']
  removed: Scalars['Boolean']
}

export type ChannelVerification = {
  /** unique Id */
  id: Scalars['String']
  /** channel verified */
  channel: Channel
  /** timestamp of verification */
  timestamp: Scalars['DateTime']
}

export type ChannelVerificationEdge = {
  node: ChannelVerification
  cursor: Scalars['String']
}

export enum ChannelVerificationOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  ChannelIdAsc = 'channel_id_ASC',
  ChannelIdDesc = 'channel_id_DESC',
  ChannelCreatedAtAsc = 'channel_createdAt_ASC',
  ChannelCreatedAtDesc = 'channel_createdAt_DESC',
  ChannelTitleAsc = 'channel_title_ASC',
  ChannelTitleDesc = 'channel_title_DESC',
  ChannelDescriptionAsc = 'channel_description_ASC',
  ChannelDescriptionDesc = 'channel_description_DESC',
  ChannelIsPublicAsc = 'channel_isPublic_ASC',
  ChannelIsPublicDesc = 'channel_isPublic_DESC',
  ChannelIsCensoredAsc = 'channel_isCensored_ASC',
  ChannelIsCensoredDesc = 'channel_isCensored_DESC',
  ChannelIsExcludedAsc = 'channel_isExcluded_ASC',
  ChannelIsExcludedDesc = 'channel_isExcluded_DESC',
  ChannelLanguageAsc = 'channel_language_ASC',
  ChannelLanguageDesc = 'channel_language_DESC',
  ChannelCreatedInBlockAsc = 'channel_createdInBlock_ASC',
  ChannelCreatedInBlockDesc = 'channel_createdInBlock_DESC',
  ChannelRewardAccountAsc = 'channel_rewardAccount_ASC',
  ChannelRewardAccountDesc = 'channel_rewardAccount_DESC',
  ChannelChannelStateBloatBondAsc = 'channel_channelStateBloatBond_ASC',
  ChannelChannelStateBloatBondDesc = 'channel_channelStateBloatBond_DESC',
  ChannelFollowsNumAsc = 'channel_followsNum_ASC',
  ChannelFollowsNumDesc = 'channel_followsNum_DESC',
  ChannelVideoViewsNumAsc = 'channel_videoViewsNum_ASC',
  ChannelVideoViewsNumDesc = 'channel_videoViewsNum_DESC',
  ChannelTotalVideosCreatedAsc = 'channel_totalVideosCreated_ASC',
  ChannelTotalVideosCreatedDesc = 'channel_totalVideosCreated_DESC',
  ChannelCumulativeRewardClaimedAsc = 'channel_cumulativeRewardClaimed_ASC',
  ChannelCumulativeRewardClaimedDesc = 'channel_cumulativeRewardClaimed_DESC',
  ChannelCumulativeRewardAsc = 'channel_cumulativeReward_ASC',
  ChannelCumulativeRewardDesc = 'channel_cumulativeReward_DESC',
  ChannelChannelWeightAsc = 'channel_channelWeight_ASC',
  ChannelChannelWeightDesc = 'channel_channelWeight_DESC',
  TimestampAsc = 'timestamp_ASC',
  TimestampDesc = 'timestamp_DESC',
}

export type ChannelVerificationWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  channel_isNull?: Maybe<Scalars['Boolean']>
  channel?: Maybe<ChannelWhereInput>
  timestamp_isNull?: Maybe<Scalars['Boolean']>
  timestamp_eq?: Maybe<Scalars['DateTime']>
  timestamp_not_eq?: Maybe<Scalars['DateTime']>
  timestamp_gt?: Maybe<Scalars['DateTime']>
  timestamp_gte?: Maybe<Scalars['DateTime']>
  timestamp_lt?: Maybe<Scalars['DateTime']>
  timestamp_lte?: Maybe<Scalars['DateTime']>
  timestamp_in?: Maybe<Array<Scalars['DateTime']>>
  timestamp_not_in?: Maybe<Array<Scalars['DateTime']>>
  AND?: Maybe<Array<ChannelVerificationWhereInput>>
  OR?: Maybe<Array<ChannelVerificationWhereInput>>
}

export type ChannelVerificationsConnection = {
  edges: Array<ChannelVerificationEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type ChannelVerified = {
  /** no data needed as recipient is channel */
  phantom?: Maybe<Scalars['Int']>
}

export type ChannelWeight = {
  channelId: Scalars['String']
  isApplied: Scalars['Boolean']
}

export type ChannelWeightInput = {
  channelId: Scalars['String']
  weight: Scalars['Float']
}

export type ChannelWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  createdAt_isNull?: Maybe<Scalars['Boolean']>
  createdAt_eq?: Maybe<Scalars['DateTime']>
  createdAt_not_eq?: Maybe<Scalars['DateTime']>
  createdAt_gt?: Maybe<Scalars['DateTime']>
  createdAt_gte?: Maybe<Scalars['DateTime']>
  createdAt_lt?: Maybe<Scalars['DateTime']>
  createdAt_lte?: Maybe<Scalars['DateTime']>
  createdAt_in?: Maybe<Array<Scalars['DateTime']>>
  createdAt_not_in?: Maybe<Array<Scalars['DateTime']>>
  ownerMember_isNull?: Maybe<Scalars['Boolean']>
  ownerMember?: Maybe<MembershipWhereInput>
  title_isNull?: Maybe<Scalars['Boolean']>
  title_eq?: Maybe<Scalars['String']>
  title_not_eq?: Maybe<Scalars['String']>
  title_gt?: Maybe<Scalars['String']>
  title_gte?: Maybe<Scalars['String']>
  title_lt?: Maybe<Scalars['String']>
  title_lte?: Maybe<Scalars['String']>
  title_in?: Maybe<Array<Scalars['String']>>
  title_not_in?: Maybe<Array<Scalars['String']>>
  title_contains?: Maybe<Scalars['String']>
  title_not_contains?: Maybe<Scalars['String']>
  title_containsInsensitive?: Maybe<Scalars['String']>
  title_not_containsInsensitive?: Maybe<Scalars['String']>
  title_startsWith?: Maybe<Scalars['String']>
  title_not_startsWith?: Maybe<Scalars['String']>
  title_endsWith?: Maybe<Scalars['String']>
  title_not_endsWith?: Maybe<Scalars['String']>
  description_isNull?: Maybe<Scalars['Boolean']>
  description_eq?: Maybe<Scalars['String']>
  description_not_eq?: Maybe<Scalars['String']>
  description_gt?: Maybe<Scalars['String']>
  description_gte?: Maybe<Scalars['String']>
  description_lt?: Maybe<Scalars['String']>
  description_lte?: Maybe<Scalars['String']>
  description_in?: Maybe<Array<Scalars['String']>>
  description_not_in?: Maybe<Array<Scalars['String']>>
  description_contains?: Maybe<Scalars['String']>
  description_not_contains?: Maybe<Scalars['String']>
  description_containsInsensitive?: Maybe<Scalars['String']>
  description_not_containsInsensitive?: Maybe<Scalars['String']>
  description_startsWith?: Maybe<Scalars['String']>
  description_not_startsWith?: Maybe<Scalars['String']>
  description_endsWith?: Maybe<Scalars['String']>
  description_not_endsWith?: Maybe<Scalars['String']>
  coverPhoto_isNull?: Maybe<Scalars['Boolean']>
  coverPhoto?: Maybe<StorageDataObjectWhereInput>
  avatarPhoto_isNull?: Maybe<Scalars['Boolean']>
  avatarPhoto?: Maybe<StorageDataObjectWhereInput>
  isPublic_isNull?: Maybe<Scalars['Boolean']>
  isPublic_eq?: Maybe<Scalars['Boolean']>
  isPublic_not_eq?: Maybe<Scalars['Boolean']>
  isCensored_isNull?: Maybe<Scalars['Boolean']>
  isCensored_eq?: Maybe<Scalars['Boolean']>
  isCensored_not_eq?: Maybe<Scalars['Boolean']>
  isExcluded_isNull?: Maybe<Scalars['Boolean']>
  isExcluded_eq?: Maybe<Scalars['Boolean']>
  isExcluded_not_eq?: Maybe<Scalars['Boolean']>
  language_isNull?: Maybe<Scalars['Boolean']>
  language_eq?: Maybe<Scalars['String']>
  language_not_eq?: Maybe<Scalars['String']>
  language_gt?: Maybe<Scalars['String']>
  language_gte?: Maybe<Scalars['String']>
  language_lt?: Maybe<Scalars['String']>
  language_lte?: Maybe<Scalars['String']>
  language_in?: Maybe<Array<Scalars['String']>>
  language_not_in?: Maybe<Array<Scalars['String']>>
  language_contains?: Maybe<Scalars['String']>
  language_not_contains?: Maybe<Scalars['String']>
  language_containsInsensitive?: Maybe<Scalars['String']>
  language_not_containsInsensitive?: Maybe<Scalars['String']>
  language_startsWith?: Maybe<Scalars['String']>
  language_not_startsWith?: Maybe<Scalars['String']>
  language_endsWith?: Maybe<Scalars['String']>
  language_not_endsWith?: Maybe<Scalars['String']>
  videos_every?: Maybe<VideoWhereInput>
  videos_some?: Maybe<VideoWhereInput>
  videos_none?: Maybe<VideoWhereInput>
  createdInBlock_isNull?: Maybe<Scalars['Boolean']>
  createdInBlock_eq?: Maybe<Scalars['Int']>
  createdInBlock_not_eq?: Maybe<Scalars['Int']>
  createdInBlock_gt?: Maybe<Scalars['Int']>
  createdInBlock_gte?: Maybe<Scalars['Int']>
  createdInBlock_lt?: Maybe<Scalars['Int']>
  createdInBlock_lte?: Maybe<Scalars['Int']>
  createdInBlock_in?: Maybe<Array<Scalars['Int']>>
  createdInBlock_not_in?: Maybe<Array<Scalars['Int']>>
  rewardAccount_isNull?: Maybe<Scalars['Boolean']>
  rewardAccount_eq?: Maybe<Scalars['String']>
  rewardAccount_not_eq?: Maybe<Scalars['String']>
  rewardAccount_gt?: Maybe<Scalars['String']>
  rewardAccount_gte?: Maybe<Scalars['String']>
  rewardAccount_lt?: Maybe<Scalars['String']>
  rewardAccount_lte?: Maybe<Scalars['String']>
  rewardAccount_in?: Maybe<Array<Scalars['String']>>
  rewardAccount_not_in?: Maybe<Array<Scalars['String']>>
  rewardAccount_contains?: Maybe<Scalars['String']>
  rewardAccount_not_contains?: Maybe<Scalars['String']>
  rewardAccount_containsInsensitive?: Maybe<Scalars['String']>
  rewardAccount_not_containsInsensitive?: Maybe<Scalars['String']>
  rewardAccount_startsWith?: Maybe<Scalars['String']>
  rewardAccount_not_startsWith?: Maybe<Scalars['String']>
  rewardAccount_endsWith?: Maybe<Scalars['String']>
  rewardAccount_not_endsWith?: Maybe<Scalars['String']>
  channelStateBloatBond_isNull?: Maybe<Scalars['Boolean']>
  channelStateBloatBond_eq?: Maybe<Scalars['BigInt']>
  channelStateBloatBond_not_eq?: Maybe<Scalars['BigInt']>
  channelStateBloatBond_gt?: Maybe<Scalars['BigInt']>
  channelStateBloatBond_gte?: Maybe<Scalars['BigInt']>
  channelStateBloatBond_lt?: Maybe<Scalars['BigInt']>
  channelStateBloatBond_lte?: Maybe<Scalars['BigInt']>
  channelStateBloatBond_in?: Maybe<Array<Scalars['BigInt']>>
  channelStateBloatBond_not_in?: Maybe<Array<Scalars['BigInt']>>
  followsNum_isNull?: Maybe<Scalars['Boolean']>
  followsNum_eq?: Maybe<Scalars['Int']>
  followsNum_not_eq?: Maybe<Scalars['Int']>
  followsNum_gt?: Maybe<Scalars['Int']>
  followsNum_gte?: Maybe<Scalars['Int']>
  followsNum_lt?: Maybe<Scalars['Int']>
  followsNum_lte?: Maybe<Scalars['Int']>
  followsNum_in?: Maybe<Array<Scalars['Int']>>
  followsNum_not_in?: Maybe<Array<Scalars['Int']>>
  videoViewsNum_isNull?: Maybe<Scalars['Boolean']>
  videoViewsNum_eq?: Maybe<Scalars['Int']>
  videoViewsNum_not_eq?: Maybe<Scalars['Int']>
  videoViewsNum_gt?: Maybe<Scalars['Int']>
  videoViewsNum_gte?: Maybe<Scalars['Int']>
  videoViewsNum_lt?: Maybe<Scalars['Int']>
  videoViewsNum_lte?: Maybe<Scalars['Int']>
  videoViewsNum_in?: Maybe<Array<Scalars['Int']>>
  videoViewsNum_not_in?: Maybe<Array<Scalars['Int']>>
  bannedMembers_every?: Maybe<BannedMemberWhereInput>
  bannedMembers_some?: Maybe<BannedMemberWhereInput>
  bannedMembers_none?: Maybe<BannedMemberWhereInput>
  entryApp_isNull?: Maybe<Scalars['Boolean']>
  entryApp?: Maybe<AppWhereInput>
  totalVideosCreated_isNull?: Maybe<Scalars['Boolean']>
  totalVideosCreated_eq?: Maybe<Scalars['Int']>
  totalVideosCreated_not_eq?: Maybe<Scalars['Int']>
  totalVideosCreated_gt?: Maybe<Scalars['Int']>
  totalVideosCreated_gte?: Maybe<Scalars['Int']>
  totalVideosCreated_lt?: Maybe<Scalars['Int']>
  totalVideosCreated_lte?: Maybe<Scalars['Int']>
  totalVideosCreated_in?: Maybe<Array<Scalars['Int']>>
  totalVideosCreated_not_in?: Maybe<Array<Scalars['Int']>>
  cumulativeRewardClaimed_isNull?: Maybe<Scalars['Boolean']>
  cumulativeRewardClaimed_eq?: Maybe<Scalars['BigInt']>
  cumulativeRewardClaimed_not_eq?: Maybe<Scalars['BigInt']>
  cumulativeRewardClaimed_gt?: Maybe<Scalars['BigInt']>
  cumulativeRewardClaimed_gte?: Maybe<Scalars['BigInt']>
  cumulativeRewardClaimed_lt?: Maybe<Scalars['BigInt']>
  cumulativeRewardClaimed_lte?: Maybe<Scalars['BigInt']>
  cumulativeRewardClaimed_in?: Maybe<Array<Scalars['BigInt']>>
  cumulativeRewardClaimed_not_in?: Maybe<Array<Scalars['BigInt']>>
  cumulativeReward_isNull?: Maybe<Scalars['Boolean']>
  cumulativeReward_eq?: Maybe<Scalars['BigInt']>
  cumulativeReward_not_eq?: Maybe<Scalars['BigInt']>
  cumulativeReward_gt?: Maybe<Scalars['BigInt']>
  cumulativeReward_gte?: Maybe<Scalars['BigInt']>
  cumulativeReward_lt?: Maybe<Scalars['BigInt']>
  cumulativeReward_lte?: Maybe<Scalars['BigInt']>
  cumulativeReward_in?: Maybe<Array<Scalars['BigInt']>>
  cumulativeReward_not_in?: Maybe<Array<Scalars['BigInt']>>
  channelWeight_isNull?: Maybe<Scalars['Boolean']>
  channelWeight_eq?: Maybe<Scalars['Float']>
  channelWeight_not_eq?: Maybe<Scalars['Float']>
  channelWeight_gt?: Maybe<Scalars['Float']>
  channelWeight_gte?: Maybe<Scalars['Float']>
  channelWeight_lt?: Maybe<Scalars['Float']>
  channelWeight_lte?: Maybe<Scalars['Float']>
  channelWeight_in?: Maybe<Array<Scalars['Float']>>
  channelWeight_not_in?: Maybe<Array<Scalars['Float']>>
  yppStatus_isNull?: Maybe<Scalars['Boolean']>
  yppStatus?: Maybe<ChannelYppStatusWhereInput>
  AND?: Maybe<Array<ChannelWhereInput>>
  OR?: Maybe<Array<ChannelWhereInput>>
}

export type ChannelYppStatus = YppUnverified | YppVerified | YppSuspended

export type ChannelYppStatusWhereInput = {
  phantom_isNull?: Maybe<Scalars['Boolean']>
  phantom_eq?: Maybe<Scalars['Int']>
  phantom_not_eq?: Maybe<Scalars['Int']>
  phantom_gt?: Maybe<Scalars['Int']>
  phantom_gte?: Maybe<Scalars['Int']>
  phantom_lt?: Maybe<Scalars['Int']>
  phantom_lte?: Maybe<Scalars['Int']>
  phantom_in?: Maybe<Array<Scalars['Int']>>
  phantom_not_in?: Maybe<Array<Scalars['Int']>>
  verification_isNull?: Maybe<Scalars['Boolean']>
  verification?: Maybe<ChannelVerificationWhereInput>
  suspension_isNull?: Maybe<Scalars['Boolean']>
  suspension?: Maybe<ChannelSuspensionWhereInput>
  isTypeOf_isNull?: Maybe<Scalars['Boolean']>
  isTypeOf_eq?: Maybe<Scalars['String']>
  isTypeOf_not_eq?: Maybe<Scalars['String']>
  isTypeOf_gt?: Maybe<Scalars['String']>
  isTypeOf_gte?: Maybe<Scalars['String']>
  isTypeOf_lt?: Maybe<Scalars['String']>
  isTypeOf_lte?: Maybe<Scalars['String']>
  isTypeOf_in?: Maybe<Array<Scalars['String']>>
  isTypeOf_not_in?: Maybe<Array<Scalars['String']>>
  isTypeOf_contains?: Maybe<Scalars['String']>
  isTypeOf_not_contains?: Maybe<Scalars['String']>
  isTypeOf_containsInsensitive?: Maybe<Scalars['String']>
  isTypeOf_not_containsInsensitive?: Maybe<Scalars['String']>
  isTypeOf_startsWith?: Maybe<Scalars['String']>
  isTypeOf_not_startsWith?: Maybe<Scalars['String']>
  isTypeOf_endsWith?: Maybe<Scalars['String']>
  isTypeOf_not_endsWith?: Maybe<Scalars['String']>
}

export type ChannelsConnection = {
  edges: Array<ChannelEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type ChannelsSearchResult = {
  channel: Channel
  relevance: Scalars['Int']
}

export type Comment = {
  /** METAPROTOCOL-{network}-{blockNumber}-{indexInBlock} */
  id: Scalars['String']
  /** Timestamp of the block the comment was created at */
  createdAt: Scalars['DateTime']
  /** Author of the video comment */
  author: Membership
  /** Comment text */
  text: Scalars['String']
  /** Video the comment was added to */
  video: Video
  /** Status of the comment; either it is visible, deleted, or moderated (deleted by moderator) */
  status: CommentStatus
  /** List of all reactions to the comment */
  reactions: Array<CommentReaction>
  /** Reactions count by reaction Id */
  reactionsCountByReactionId?: Maybe<Array<CommentReactionsCountByReactionId>>
  /** A (parent) comment that this comment replies to (if any) */
  parentComment?: Maybe<Comment>
  /** How many comments has replied to this comment */
  repliesCount: Scalars['Int']
  /** Total number of reactions to this comment */
  reactionsCount: Scalars['Int']
  /** Sum of replies and reactions */
  reactionsAndRepliesCount: Scalars['Int']
  /** Whether comment has been edited or not */
  isEdited: Scalars['Boolean']
  /** Whether a comment has been excluded/hidden (by the gateway operator) */
  isExcluded: Scalars['Boolean']
}

export type CommentReactionsArgs = {
  where?: Maybe<CommentReactionWhereInput>
  orderBy?: Maybe<Array<CommentReactionOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type CommentCreatedEventData = {
  /** The comment that was added */
  comment: Comment
  /** Comment's original text */
  text: Scalars['String']
}

export type CommentEdge = {
  node: Comment
  cursor: Scalars['String']
}

export enum CommentOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  CreatedAtAsc = 'createdAt_ASC',
  CreatedAtDesc = 'createdAt_DESC',
  AuthorIdAsc = 'author_id_ASC',
  AuthorIdDesc = 'author_id_DESC',
  AuthorCreatedAtAsc = 'author_createdAt_ASC',
  AuthorCreatedAtDesc = 'author_createdAt_DESC',
  AuthorHandleAsc = 'author_handle_ASC',
  AuthorHandleDesc = 'author_handle_DESC',
  AuthorHandleRawAsc = 'author_handleRaw_ASC',
  AuthorHandleRawDesc = 'author_handleRaw_DESC',
  AuthorControllerAccountAsc = 'author_controllerAccount_ASC',
  AuthorControllerAccountDesc = 'author_controllerAccount_DESC',
  AuthorTotalChannelsCreatedAsc = 'author_totalChannelsCreated_ASC',
  AuthorTotalChannelsCreatedDesc = 'author_totalChannelsCreated_DESC',
  TextAsc = 'text_ASC',
  TextDesc = 'text_DESC',
  VideoIdAsc = 'video_id_ASC',
  VideoIdDesc = 'video_id_DESC',
  VideoCreatedAtAsc = 'video_createdAt_ASC',
  VideoCreatedAtDesc = 'video_createdAt_DESC',
  VideoTitleAsc = 'video_title_ASC',
  VideoTitleDesc = 'video_title_DESC',
  VideoDescriptionAsc = 'video_description_ASC',
  VideoDescriptionDesc = 'video_description_DESC',
  VideoDurationAsc = 'video_duration_ASC',
  VideoDurationDesc = 'video_duration_DESC',
  VideoLanguageAsc = 'video_language_ASC',
  VideoLanguageDesc = 'video_language_DESC',
  VideoOrionLanguageAsc = 'video_orionLanguage_ASC',
  VideoOrionLanguageDesc = 'video_orionLanguage_DESC',
  VideoHasMarketingAsc = 'video_hasMarketing_ASC',
  VideoHasMarketingDesc = 'video_hasMarketing_DESC',
  VideoPublishedBeforeJoystreamAsc = 'video_publishedBeforeJoystream_ASC',
  VideoPublishedBeforeJoystreamDesc = 'video_publishedBeforeJoystream_DESC',
  VideoIsPublicAsc = 'video_isPublic_ASC',
  VideoIsPublicDesc = 'video_isPublic_DESC',
  VideoIsCensoredAsc = 'video_isCensored_ASC',
  VideoIsCensoredDesc = 'video_isCensored_DESC',
  VideoIsExcludedAsc = 'video_isExcluded_ASC',
  VideoIsExcludedDesc = 'video_isExcluded_DESC',
  VideoIsExplicitAsc = 'video_isExplicit_ASC',
  VideoIsExplicitDesc = 'video_isExplicit_DESC',
  VideoVideoStateBloatBondAsc = 'video_videoStateBloatBond_ASC',
  VideoVideoStateBloatBondDesc = 'video_videoStateBloatBond_DESC',
  VideoCreatedInBlockAsc = 'video_createdInBlock_ASC',
  VideoCreatedInBlockDesc = 'video_createdInBlock_DESC',
  VideoIsCommentSectionEnabledAsc = 'video_isCommentSectionEnabled_ASC',
  VideoIsCommentSectionEnabledDesc = 'video_isCommentSectionEnabled_DESC',
  VideoCommentsCountAsc = 'video_commentsCount_ASC',
  VideoCommentsCountDesc = 'video_commentsCount_DESC',
  VideoIsReactionFeatureEnabledAsc = 'video_isReactionFeatureEnabled_ASC',
  VideoIsReactionFeatureEnabledDesc = 'video_isReactionFeatureEnabled_DESC',
  VideoReactionsCountAsc = 'video_reactionsCount_ASC',
  VideoReactionsCountDesc = 'video_reactionsCount_DESC',
  VideoViewsNumAsc = 'video_viewsNum_ASC',
  VideoViewsNumDesc = 'video_viewsNum_DESC',
  VideoYtVideoIdAsc = 'video_ytVideoId_ASC',
  VideoYtVideoIdDesc = 'video_ytVideoId_DESC',
  VideoVideoRelevanceAsc = 'video_videoRelevance_ASC',
  VideoVideoRelevanceDesc = 'video_videoRelevance_DESC',
  VideoIsShortAsc = 'video_isShort_ASC',
  VideoIsShortDesc = 'video_isShort_DESC',
  VideoIncludeInHomeFeedAsc = 'video_includeInHomeFeed_ASC',
  VideoIncludeInHomeFeedDesc = 'video_includeInHomeFeed_DESC',
  StatusAsc = 'status_ASC',
  StatusDesc = 'status_DESC',
  ParentCommentIdAsc = 'parentComment_id_ASC',
  ParentCommentIdDesc = 'parentComment_id_DESC',
  ParentCommentCreatedAtAsc = 'parentComment_createdAt_ASC',
  ParentCommentCreatedAtDesc = 'parentComment_createdAt_DESC',
  ParentCommentTextAsc = 'parentComment_text_ASC',
  ParentCommentTextDesc = 'parentComment_text_DESC',
  ParentCommentStatusAsc = 'parentComment_status_ASC',
  ParentCommentStatusDesc = 'parentComment_status_DESC',
  ParentCommentRepliesCountAsc = 'parentComment_repliesCount_ASC',
  ParentCommentRepliesCountDesc = 'parentComment_repliesCount_DESC',
  ParentCommentReactionsCountAsc = 'parentComment_reactionsCount_ASC',
  ParentCommentReactionsCountDesc = 'parentComment_reactionsCount_DESC',
  ParentCommentReactionsAndRepliesCountAsc = 'parentComment_reactionsAndRepliesCount_ASC',
  ParentCommentReactionsAndRepliesCountDesc = 'parentComment_reactionsAndRepliesCount_DESC',
  ParentCommentIsEditedAsc = 'parentComment_isEdited_ASC',
  ParentCommentIsEditedDesc = 'parentComment_isEdited_DESC',
  ParentCommentIsExcludedAsc = 'parentComment_isExcluded_ASC',
  ParentCommentIsExcludedDesc = 'parentComment_isExcluded_DESC',
  RepliesCountAsc = 'repliesCount_ASC',
  RepliesCountDesc = 'repliesCount_DESC',
  ReactionsCountAsc = 'reactionsCount_ASC',
  ReactionsCountDesc = 'reactionsCount_DESC',
  ReactionsAndRepliesCountAsc = 'reactionsAndRepliesCount_ASC',
  ReactionsAndRepliesCountDesc = 'reactionsAndRepliesCount_DESC',
  IsEditedAsc = 'isEdited_ASC',
  IsEditedDesc = 'isEdited_DESC',
  IsExcludedAsc = 'isExcluded_ASC',
  IsExcludedDesc = 'isExcluded_DESC',
}

export type CommentPostedToVideo = {
  /** video title used for notification text */
  videoTitle: Scalars['String']
  /** video Id used for link */
  videoId: Scalars['String']
  /** commenter id for the avatar */
  memberId: Scalars['String']
  /** commenter handle for text */
  memberHandle: Scalars['String']
  /** id for the comment used for the link */
  comentId: Scalars['String']
}

export type CommentReaction = {
  /** {memberId}-{commentId}-{reactionId} */
  id: Scalars['String']
  /** The Reaction id */
  reactionId: Scalars['Int']
  /** The member that reacted */
  member: Membership
  /** The comment that has been reacted to */
  comment: Comment
  /** The video the comment (that has been reacted) exists */
  video: Video
}

export type CommentReactionEdge = {
  node: CommentReaction
  cursor: Scalars['String']
}

export type CommentReactionEventData = {
  /** comment reaction reference */
  commentReaction: CommentReaction
}

export enum CommentReactionOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  ReactionIdAsc = 'reactionId_ASC',
  ReactionIdDesc = 'reactionId_DESC',
  MemberIdAsc = 'member_id_ASC',
  MemberIdDesc = 'member_id_DESC',
  MemberCreatedAtAsc = 'member_createdAt_ASC',
  MemberCreatedAtDesc = 'member_createdAt_DESC',
  MemberHandleAsc = 'member_handle_ASC',
  MemberHandleDesc = 'member_handle_DESC',
  MemberHandleRawAsc = 'member_handleRaw_ASC',
  MemberHandleRawDesc = 'member_handleRaw_DESC',
  MemberControllerAccountAsc = 'member_controllerAccount_ASC',
  MemberControllerAccountDesc = 'member_controllerAccount_DESC',
  MemberTotalChannelsCreatedAsc = 'member_totalChannelsCreated_ASC',
  MemberTotalChannelsCreatedDesc = 'member_totalChannelsCreated_DESC',
  CommentIdAsc = 'comment_id_ASC',
  CommentIdDesc = 'comment_id_DESC',
  CommentCreatedAtAsc = 'comment_createdAt_ASC',
  CommentCreatedAtDesc = 'comment_createdAt_DESC',
  CommentTextAsc = 'comment_text_ASC',
  CommentTextDesc = 'comment_text_DESC',
  CommentStatusAsc = 'comment_status_ASC',
  CommentStatusDesc = 'comment_status_DESC',
  CommentRepliesCountAsc = 'comment_repliesCount_ASC',
  CommentRepliesCountDesc = 'comment_repliesCount_DESC',
  CommentReactionsCountAsc = 'comment_reactionsCount_ASC',
  CommentReactionsCountDesc = 'comment_reactionsCount_DESC',
  CommentReactionsAndRepliesCountAsc = 'comment_reactionsAndRepliesCount_ASC',
  CommentReactionsAndRepliesCountDesc = 'comment_reactionsAndRepliesCount_DESC',
  CommentIsEditedAsc = 'comment_isEdited_ASC',
  CommentIsEditedDesc = 'comment_isEdited_DESC',
  CommentIsExcludedAsc = 'comment_isExcluded_ASC',
  CommentIsExcludedDesc = 'comment_isExcluded_DESC',
  VideoIdAsc = 'video_id_ASC',
  VideoIdDesc = 'video_id_DESC',
  VideoCreatedAtAsc = 'video_createdAt_ASC',
  VideoCreatedAtDesc = 'video_createdAt_DESC',
  VideoTitleAsc = 'video_title_ASC',
  VideoTitleDesc = 'video_title_DESC',
  VideoDescriptionAsc = 'video_description_ASC',
  VideoDescriptionDesc = 'video_description_DESC',
  VideoDurationAsc = 'video_duration_ASC',
  VideoDurationDesc = 'video_duration_DESC',
  VideoLanguageAsc = 'video_language_ASC',
  VideoLanguageDesc = 'video_language_DESC',
  VideoOrionLanguageAsc = 'video_orionLanguage_ASC',
  VideoOrionLanguageDesc = 'video_orionLanguage_DESC',
  VideoHasMarketingAsc = 'video_hasMarketing_ASC',
  VideoHasMarketingDesc = 'video_hasMarketing_DESC',
  VideoPublishedBeforeJoystreamAsc = 'video_publishedBeforeJoystream_ASC',
  VideoPublishedBeforeJoystreamDesc = 'video_publishedBeforeJoystream_DESC',
  VideoIsPublicAsc = 'video_isPublic_ASC',
  VideoIsPublicDesc = 'video_isPublic_DESC',
  VideoIsCensoredAsc = 'video_isCensored_ASC',
  VideoIsCensoredDesc = 'video_isCensored_DESC',
  VideoIsExcludedAsc = 'video_isExcluded_ASC',
  VideoIsExcludedDesc = 'video_isExcluded_DESC',
  VideoIsExplicitAsc = 'video_isExplicit_ASC',
  VideoIsExplicitDesc = 'video_isExplicit_DESC',
  VideoVideoStateBloatBondAsc = 'video_videoStateBloatBond_ASC',
  VideoVideoStateBloatBondDesc = 'video_videoStateBloatBond_DESC',
  VideoCreatedInBlockAsc = 'video_createdInBlock_ASC',
  VideoCreatedInBlockDesc = 'video_createdInBlock_DESC',
  VideoIsCommentSectionEnabledAsc = 'video_isCommentSectionEnabled_ASC',
  VideoIsCommentSectionEnabledDesc = 'video_isCommentSectionEnabled_DESC',
  VideoCommentsCountAsc = 'video_commentsCount_ASC',
  VideoCommentsCountDesc = 'video_commentsCount_DESC',
  VideoIsReactionFeatureEnabledAsc = 'video_isReactionFeatureEnabled_ASC',
  VideoIsReactionFeatureEnabledDesc = 'video_isReactionFeatureEnabled_DESC',
  VideoReactionsCountAsc = 'video_reactionsCount_ASC',
  VideoReactionsCountDesc = 'video_reactionsCount_DESC',
  VideoViewsNumAsc = 'video_viewsNum_ASC',
  VideoViewsNumDesc = 'video_viewsNum_DESC',
  VideoYtVideoIdAsc = 'video_ytVideoId_ASC',
  VideoYtVideoIdDesc = 'video_ytVideoId_DESC',
  VideoVideoRelevanceAsc = 'video_videoRelevance_ASC',
  VideoVideoRelevanceDesc = 'video_videoRelevance_DESC',
  VideoIsShortAsc = 'video_isShort_ASC',
  VideoIsShortDesc = 'video_isShort_DESC',
  VideoIncludeInHomeFeedAsc = 'video_includeInHomeFeed_ASC',
  VideoIncludeInHomeFeedDesc = 'video_includeInHomeFeed_DESC',
}

export type CommentReactionWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  reactionId_isNull?: Maybe<Scalars['Boolean']>
  reactionId_eq?: Maybe<Scalars['Int']>
  reactionId_not_eq?: Maybe<Scalars['Int']>
  reactionId_gt?: Maybe<Scalars['Int']>
  reactionId_gte?: Maybe<Scalars['Int']>
  reactionId_lt?: Maybe<Scalars['Int']>
  reactionId_lte?: Maybe<Scalars['Int']>
  reactionId_in?: Maybe<Array<Scalars['Int']>>
  reactionId_not_in?: Maybe<Array<Scalars['Int']>>
  member_isNull?: Maybe<Scalars['Boolean']>
  member?: Maybe<MembershipWhereInput>
  comment_isNull?: Maybe<Scalars['Boolean']>
  comment?: Maybe<CommentWhereInput>
  video_isNull?: Maybe<Scalars['Boolean']>
  video?: Maybe<VideoWhereInput>
  AND?: Maybe<Array<CommentReactionWhereInput>>
  OR?: Maybe<Array<CommentReactionWhereInput>>
}

export type CommentReactionsConnection = {
  edges: Array<CommentReactionEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type CommentReactionsCountByReactionId = {
  /** The reaction id */
  reactionId: Scalars['Int']
  /** No of times the comment has been reacted with given reaction Id */
  count: Scalars['Int']
}

export type CommentReply = {
  /** comment Id for the link */
  commentId: Scalars['String']
  /** video Id used for link */
  videoId: Scalars['String']
  /** video title for notification text */
  videoTitle: Scalars['String']
  /** member who replied */
  memberId: Scalars['String']
  /** member who replied */
  memberHandle: Scalars['String']
}

export enum CommentStatus {
  Visible = 'VISIBLE',
  Deleted = 'DELETED',
  Moderated = 'MODERATED',
}

export type CommentTextUpdatedEventData = {
  /** The comment being updated */
  comment: Comment
  /** New comment text */
  newText: Scalars['String']
}

export type CommentWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  createdAt_isNull?: Maybe<Scalars['Boolean']>
  createdAt_eq?: Maybe<Scalars['DateTime']>
  createdAt_not_eq?: Maybe<Scalars['DateTime']>
  createdAt_gt?: Maybe<Scalars['DateTime']>
  createdAt_gte?: Maybe<Scalars['DateTime']>
  createdAt_lt?: Maybe<Scalars['DateTime']>
  createdAt_lte?: Maybe<Scalars['DateTime']>
  createdAt_in?: Maybe<Array<Scalars['DateTime']>>
  createdAt_not_in?: Maybe<Array<Scalars['DateTime']>>
  author_isNull?: Maybe<Scalars['Boolean']>
  author?: Maybe<MembershipWhereInput>
  text_isNull?: Maybe<Scalars['Boolean']>
  text_eq?: Maybe<Scalars['String']>
  text_not_eq?: Maybe<Scalars['String']>
  text_gt?: Maybe<Scalars['String']>
  text_gte?: Maybe<Scalars['String']>
  text_lt?: Maybe<Scalars['String']>
  text_lte?: Maybe<Scalars['String']>
  text_in?: Maybe<Array<Scalars['String']>>
  text_not_in?: Maybe<Array<Scalars['String']>>
  text_contains?: Maybe<Scalars['String']>
  text_not_contains?: Maybe<Scalars['String']>
  text_containsInsensitive?: Maybe<Scalars['String']>
  text_not_containsInsensitive?: Maybe<Scalars['String']>
  text_startsWith?: Maybe<Scalars['String']>
  text_not_startsWith?: Maybe<Scalars['String']>
  text_endsWith?: Maybe<Scalars['String']>
  text_not_endsWith?: Maybe<Scalars['String']>
  video_isNull?: Maybe<Scalars['Boolean']>
  video?: Maybe<VideoWhereInput>
  status_isNull?: Maybe<Scalars['Boolean']>
  status_eq?: Maybe<CommentStatus>
  status_not_eq?: Maybe<CommentStatus>
  status_in?: Maybe<Array<CommentStatus>>
  status_not_in?: Maybe<Array<CommentStatus>>
  reactions_every?: Maybe<CommentReactionWhereInput>
  reactions_some?: Maybe<CommentReactionWhereInput>
  reactions_none?: Maybe<CommentReactionWhereInput>
  reactionsCountByReactionId_isNull?: Maybe<Scalars['Boolean']>
  parentComment_isNull?: Maybe<Scalars['Boolean']>
  parentComment?: Maybe<CommentWhereInput>
  repliesCount_isNull?: Maybe<Scalars['Boolean']>
  repliesCount_eq?: Maybe<Scalars['Int']>
  repliesCount_not_eq?: Maybe<Scalars['Int']>
  repliesCount_gt?: Maybe<Scalars['Int']>
  repliesCount_gte?: Maybe<Scalars['Int']>
  repliesCount_lt?: Maybe<Scalars['Int']>
  repliesCount_lte?: Maybe<Scalars['Int']>
  repliesCount_in?: Maybe<Array<Scalars['Int']>>
  repliesCount_not_in?: Maybe<Array<Scalars['Int']>>
  reactionsCount_isNull?: Maybe<Scalars['Boolean']>
  reactionsCount_eq?: Maybe<Scalars['Int']>
  reactionsCount_not_eq?: Maybe<Scalars['Int']>
  reactionsCount_gt?: Maybe<Scalars['Int']>
  reactionsCount_gte?: Maybe<Scalars['Int']>
  reactionsCount_lt?: Maybe<Scalars['Int']>
  reactionsCount_lte?: Maybe<Scalars['Int']>
  reactionsCount_in?: Maybe<Array<Scalars['Int']>>
  reactionsCount_not_in?: Maybe<Array<Scalars['Int']>>
  reactionsAndRepliesCount_isNull?: Maybe<Scalars['Boolean']>
  reactionsAndRepliesCount_eq?: Maybe<Scalars['Int']>
  reactionsAndRepliesCount_not_eq?: Maybe<Scalars['Int']>
  reactionsAndRepliesCount_gt?: Maybe<Scalars['Int']>
  reactionsAndRepliesCount_gte?: Maybe<Scalars['Int']>
  reactionsAndRepliesCount_lt?: Maybe<Scalars['Int']>
  reactionsAndRepliesCount_lte?: Maybe<Scalars['Int']>
  reactionsAndRepliesCount_in?: Maybe<Array<Scalars['Int']>>
  reactionsAndRepliesCount_not_in?: Maybe<Array<Scalars['Int']>>
  isEdited_isNull?: Maybe<Scalars['Boolean']>
  isEdited_eq?: Maybe<Scalars['Boolean']>
  isEdited_not_eq?: Maybe<Scalars['Boolean']>
  isExcluded_isNull?: Maybe<Scalars['Boolean']>
  isExcluded_eq?: Maybe<Scalars['Boolean']>
  isExcluded_not_eq?: Maybe<Scalars['Boolean']>
  AND?: Maybe<Array<CommentWhereInput>>
  OR?: Maybe<Array<CommentWhereInput>>
}

export type CommentsConnection = {
  edges: Array<CommentEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type ContentActor = ContentActorCurator | ContentActorMember | ContentActorLead

export type ContentActorCurator = {
  curator: Curator
}

export type ContentActorLead = {
  phantom?: Maybe<Scalars['Int']>
}

export type ContentActorMember = {
  member: Membership
}

export type ContentActorWhereInput = {
  curator_isNull?: Maybe<Scalars['Boolean']>
  curator?: Maybe<CuratorWhereInput>
  member_isNull?: Maybe<Scalars['Boolean']>
  member?: Maybe<MembershipWhereInput>
  phantom_isNull?: Maybe<Scalars['Boolean']>
  phantom_eq?: Maybe<Scalars['Int']>
  phantom_not_eq?: Maybe<Scalars['Int']>
  phantom_gt?: Maybe<Scalars['Int']>
  phantom_gte?: Maybe<Scalars['Int']>
  phantom_lt?: Maybe<Scalars['Int']>
  phantom_lte?: Maybe<Scalars['Int']>
  phantom_in?: Maybe<Array<Scalars['Int']>>
  phantom_not_in?: Maybe<Array<Scalars['Int']>>
  isTypeOf_isNull?: Maybe<Scalars['Boolean']>
  isTypeOf_eq?: Maybe<Scalars['String']>
  isTypeOf_not_eq?: Maybe<Scalars['String']>
  isTypeOf_gt?: Maybe<Scalars['String']>
  isTypeOf_gte?: Maybe<Scalars['String']>
  isTypeOf_lt?: Maybe<Scalars['String']>
  isTypeOf_lte?: Maybe<Scalars['String']>
  isTypeOf_in?: Maybe<Array<Scalars['String']>>
  isTypeOf_not_in?: Maybe<Array<Scalars['String']>>
  isTypeOf_contains?: Maybe<Scalars['String']>
  isTypeOf_not_contains?: Maybe<Scalars['String']>
  isTypeOf_containsInsensitive?: Maybe<Scalars['String']>
  isTypeOf_not_containsInsensitive?: Maybe<Scalars['String']>
  isTypeOf_startsWith?: Maybe<Scalars['String']>
  isTypeOf_not_startsWith?: Maybe<Scalars['String']>
  isTypeOf_endsWith?: Maybe<Scalars['String']>
  isTypeOf_not_endsWith?: Maybe<Scalars['String']>
}

export enum Continent {
  Af = 'AF',
  Na = 'NA',
  Oc = 'OC',
  An = 'AN',
  As = 'AS',
  Eu = 'EU',
  Sa = 'SA',
}

export type CreatorReceivesAuctionBid = {
  /** videoId used for notification link */
  videoId: Scalars['String']
  /** video title used for notification text */
  videoTitle: Scalars['String']
  /** bidder id for notification the avatar */
  bidderId: Scalars['String']
  /** bidder handle for notification text */
  bidderHandle: Scalars['String']
  /** bid amount */
  amount: Scalars['BigInt']
}

export type Curator = {
  /** Runtime identifier */
  id: Scalars['String']
}

export type CuratorEdge = {
  node: Curator
  cursor: Scalars['String']
}

export type CuratorGroup = {
  /** Runtime identifier */
  id: Scalars['String']
  /** Is group active or not */
  isActive: Scalars['Boolean']
}

export type CuratorGroupEdge = {
  node: CuratorGroup
  cursor: Scalars['String']
}

export enum CuratorGroupOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  IsActiveAsc = 'isActive_ASC',
  IsActiveDesc = 'isActive_DESC',
}

export type CuratorGroupWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  isActive_isNull?: Maybe<Scalars['Boolean']>
  isActive_eq?: Maybe<Scalars['Boolean']>
  isActive_not_eq?: Maybe<Scalars['Boolean']>
  AND?: Maybe<Array<CuratorGroupWhereInput>>
  OR?: Maybe<Array<CuratorGroupWhereInput>>
}

export type CuratorGroupsConnection = {
  edges: Array<CuratorGroupEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export enum CuratorOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
}

export type CuratorWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  AND?: Maybe<Array<CuratorWhereInput>>
  OR?: Maybe<Array<CuratorWhereInput>>
}

export type CuratorsConnection = {
  edges: Array<CuratorEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type DataObjectType =
  | DataObjectTypeChannelAvatar
  | DataObjectTypeChannelCoverPhoto
  | DataObjectTypeVideoMedia
  | DataObjectTypeVideoThumbnail
  | DataObjectTypeVideoSubtitle
  | DataObjectTypeChannelPayoutsPayload

export type DataObjectTypeChannelAvatar = {
  /** Related channel entity */
  channel: Channel
}

export type DataObjectTypeChannelCoverPhoto = {
  /** Related channel entity */
  channel: Channel
}

export type DataObjectTypeChannelPayoutsPayload = {
  phantom?: Maybe<Scalars['Int']>
}

export type DataObjectTypeVideoMedia = {
  /** Related video entity */
  video: Video
}

export type DataObjectTypeVideoSubtitle = {
  /** Related subtitle entity */
  subtitle: VideoSubtitle
  /** Related video entity */
  video: Video
}

export type DataObjectTypeVideoThumbnail = {
  /** Related video entity */
  video: Video
}

export type DataObjectTypeWhereInput = {
  channel_isNull?: Maybe<Scalars['Boolean']>
  channel?: Maybe<ChannelWhereInput>
  video_isNull?: Maybe<Scalars['Boolean']>
  video?: Maybe<VideoWhereInput>
  subtitle_isNull?: Maybe<Scalars['Boolean']>
  subtitle?: Maybe<VideoSubtitleWhereInput>
  phantom_isNull?: Maybe<Scalars['Boolean']>
  phantom_eq?: Maybe<Scalars['Int']>
  phantom_not_eq?: Maybe<Scalars['Int']>
  phantom_gt?: Maybe<Scalars['Int']>
  phantom_gte?: Maybe<Scalars['Int']>
  phantom_lt?: Maybe<Scalars['Int']>
  phantom_lte?: Maybe<Scalars['Int']>
  phantom_in?: Maybe<Array<Scalars['Int']>>
  phantom_not_in?: Maybe<Array<Scalars['Int']>>
  isTypeOf_isNull?: Maybe<Scalars['Boolean']>
  isTypeOf_eq?: Maybe<Scalars['String']>
  isTypeOf_not_eq?: Maybe<Scalars['String']>
  isTypeOf_gt?: Maybe<Scalars['String']>
  isTypeOf_gte?: Maybe<Scalars['String']>
  isTypeOf_lt?: Maybe<Scalars['String']>
  isTypeOf_lte?: Maybe<Scalars['String']>
  isTypeOf_in?: Maybe<Array<Scalars['String']>>
  isTypeOf_not_in?: Maybe<Array<Scalars['String']>>
  isTypeOf_contains?: Maybe<Scalars['String']>
  isTypeOf_not_contains?: Maybe<Scalars['String']>
  isTypeOf_containsInsensitive?: Maybe<Scalars['String']>
  isTypeOf_not_containsInsensitive?: Maybe<Scalars['String']>
  isTypeOf_startsWith?: Maybe<Scalars['String']>
  isTypeOf_not_startsWith?: Maybe<Scalars['String']>
  isTypeOf_endsWith?: Maybe<Scalars['String']>
  isTypeOf_not_endsWith?: Maybe<Scalars['String']>
}

export type DeliveryStatus = EmailSuccess | EmailFailure

export type DeliveryStatusWhereInput = {
  phantom_isNull?: Maybe<Scalars['Boolean']>
  phantom_eq?: Maybe<Scalars['Int']>
  phantom_not_eq?: Maybe<Scalars['Int']>
  phantom_gt?: Maybe<Scalars['Int']>
  phantom_gte?: Maybe<Scalars['Int']>
  phantom_lt?: Maybe<Scalars['Int']>
  phantom_lte?: Maybe<Scalars['Int']>
  phantom_in?: Maybe<Array<Scalars['Int']>>
  phantom_not_in?: Maybe<Array<Scalars['Int']>>
  errorStatus_isNull?: Maybe<Scalars['Boolean']>
  errorStatus_eq?: Maybe<Scalars['String']>
  errorStatus_not_eq?: Maybe<Scalars['String']>
  errorStatus_gt?: Maybe<Scalars['String']>
  errorStatus_gte?: Maybe<Scalars['String']>
  errorStatus_lt?: Maybe<Scalars['String']>
  errorStatus_lte?: Maybe<Scalars['String']>
  errorStatus_in?: Maybe<Array<Scalars['String']>>
  errorStatus_not_in?: Maybe<Array<Scalars['String']>>
  errorStatus_contains?: Maybe<Scalars['String']>
  errorStatus_not_contains?: Maybe<Scalars['String']>
  errorStatus_containsInsensitive?: Maybe<Scalars['String']>
  errorStatus_not_containsInsensitive?: Maybe<Scalars['String']>
  errorStatus_startsWith?: Maybe<Scalars['String']>
  errorStatus_not_startsWith?: Maybe<Scalars['String']>
  errorStatus_endsWith?: Maybe<Scalars['String']>
  errorStatus_not_endsWith?: Maybe<Scalars['String']>
  isTypeOf_isNull?: Maybe<Scalars['Boolean']>
  isTypeOf_eq?: Maybe<Scalars['String']>
  isTypeOf_not_eq?: Maybe<Scalars['String']>
  isTypeOf_gt?: Maybe<Scalars['String']>
  isTypeOf_gte?: Maybe<Scalars['String']>
  isTypeOf_lt?: Maybe<Scalars['String']>
  isTypeOf_lte?: Maybe<Scalars['String']>
  isTypeOf_in?: Maybe<Array<Scalars['String']>>
  isTypeOf_not_in?: Maybe<Array<Scalars['String']>>
  isTypeOf_contains?: Maybe<Scalars['String']>
  isTypeOf_not_contains?: Maybe<Scalars['String']>
  isTypeOf_containsInsensitive?: Maybe<Scalars['String']>
  isTypeOf_not_containsInsensitive?: Maybe<Scalars['String']>
  isTypeOf_startsWith?: Maybe<Scalars['String']>
  isTypeOf_not_startsWith?: Maybe<Scalars['String']>
  isTypeOf_endsWith?: Maybe<Scalars['String']>
  isTypeOf_not_endsWith?: Maybe<Scalars['String']>
}

export type DirectChannelPaymentByMember = {
  /** payer id */
  payerId: Scalars['String']
  /** payer handle */
  payerHandle: Scalars['String']
  /** amount paid */
  amount: Scalars['BigInt']
}

export type DistributionBucket = {
  /** Runtime bucket id in {familyId}:{bucketIndex} format */
  id: Scalars['String']
  /** Distribution family the bucket is part of */
  family: DistributionBucketFamily
  /** Bucket index within the family */
  bucketIndex: Scalars['Int']
  /** Distribution bucket operators (either active or invited) */
  operators: Array<DistributionBucketOperator>
  /** Whether the bucket is accepting any new bags */
  acceptingNewBags: Scalars['Boolean']
  /** Whether the bucket is currently distributing content */
  distributing: Scalars['Boolean']
  /** Storage bags assigned to the bucket */
  bags: Array<DistributionBucketBag>
}

export type DistributionBucketOperatorsArgs = {
  where?: Maybe<DistributionBucketOperatorWhereInput>
  orderBy?: Maybe<Array<DistributionBucketOperatorOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type DistributionBucketBagsArgs = {
  where?: Maybe<DistributionBucketBagWhereInput>
  orderBy?: Maybe<Array<DistributionBucketBagOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type DistributionBucketBag = {
  /** {distributionBucketId}-{storageBagId} */
  id: Scalars['String']
  distributionBucket: DistributionBucket
  bag: StorageBag
}

export type DistributionBucketBagEdge = {
  node: DistributionBucketBag
  cursor: Scalars['String']
}

export enum DistributionBucketBagOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  DistributionBucketIdAsc = 'distributionBucket_id_ASC',
  DistributionBucketIdDesc = 'distributionBucket_id_DESC',
  DistributionBucketBucketIndexAsc = 'distributionBucket_bucketIndex_ASC',
  DistributionBucketBucketIndexDesc = 'distributionBucket_bucketIndex_DESC',
  DistributionBucketAcceptingNewBagsAsc = 'distributionBucket_acceptingNewBags_ASC',
  DistributionBucketAcceptingNewBagsDesc = 'distributionBucket_acceptingNewBags_DESC',
  DistributionBucketDistributingAsc = 'distributionBucket_distributing_ASC',
  DistributionBucketDistributingDesc = 'distributionBucket_distributing_DESC',
  BagIdAsc = 'bag_id_ASC',
  BagIdDesc = 'bag_id_DESC',
}

export type DistributionBucketBagWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  distributionBucket_isNull?: Maybe<Scalars['Boolean']>
  distributionBucket?: Maybe<DistributionBucketWhereInput>
  bag_isNull?: Maybe<Scalars['Boolean']>
  bag?: Maybe<StorageBagWhereInput>
  AND?: Maybe<Array<DistributionBucketBagWhereInput>>
  OR?: Maybe<Array<DistributionBucketBagWhereInput>>
}

export type DistributionBucketBagsConnection = {
  edges: Array<DistributionBucketBagEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type DistributionBucketEdge = {
  node: DistributionBucket
  cursor: Scalars['String']
}

export type DistributionBucketFamiliesConnection = {
  edges: Array<DistributionBucketFamilyEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type DistributionBucketFamily = {
  /** Runtime bucket family id */
  id: Scalars['String']
  /** Current bucket family metadata */
  metadata?: Maybe<DistributionBucketFamilyMetadata>
  /** Distribution buckets belonging to the family */
  buckets: Array<DistributionBucket>
}

export type DistributionBucketFamilyBucketsArgs = {
  where?: Maybe<DistributionBucketWhereInput>
  orderBy?: Maybe<Array<DistributionBucketOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type DistributionBucketFamilyEdge = {
  node: DistributionBucketFamily
  cursor: Scalars['String']
}

export type DistributionBucketFamilyMetadata = {
  id: Scalars['String']
  /** Distribution bucket family */
  family: DistributionBucketFamily
  /** Name of the geographical region covered by the family (ie.: us-east-1) */
  region?: Maybe<Scalars['String']>
  /** Optional, more specific description of the region covered by the family */
  description?: Maybe<Scalars['String']>
  /** Geographical areas covered by the family */
  areas?: Maybe<Array<GeographicalArea>>
  /** List of targets (hosts/ips) best suited latency measurements for the family */
  latencyTestTargets?: Maybe<Array<Maybe<Scalars['String']>>>
}

export type DistributionBucketFamilyMetadataConnection = {
  edges: Array<DistributionBucketFamilyMetadataEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type DistributionBucketFamilyMetadataEdge = {
  node: DistributionBucketFamilyMetadata
  cursor: Scalars['String']
}

export enum DistributionBucketFamilyMetadataOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  FamilyIdAsc = 'family_id_ASC',
  FamilyIdDesc = 'family_id_DESC',
  RegionAsc = 'region_ASC',
  RegionDesc = 'region_DESC',
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC',
}

export type DistributionBucketFamilyMetadataWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  family_isNull?: Maybe<Scalars['Boolean']>
  family?: Maybe<DistributionBucketFamilyWhereInput>
  region_isNull?: Maybe<Scalars['Boolean']>
  region_eq?: Maybe<Scalars['String']>
  region_not_eq?: Maybe<Scalars['String']>
  region_gt?: Maybe<Scalars['String']>
  region_gte?: Maybe<Scalars['String']>
  region_lt?: Maybe<Scalars['String']>
  region_lte?: Maybe<Scalars['String']>
  region_in?: Maybe<Array<Scalars['String']>>
  region_not_in?: Maybe<Array<Scalars['String']>>
  region_contains?: Maybe<Scalars['String']>
  region_not_contains?: Maybe<Scalars['String']>
  region_containsInsensitive?: Maybe<Scalars['String']>
  region_not_containsInsensitive?: Maybe<Scalars['String']>
  region_startsWith?: Maybe<Scalars['String']>
  region_not_startsWith?: Maybe<Scalars['String']>
  region_endsWith?: Maybe<Scalars['String']>
  region_not_endsWith?: Maybe<Scalars['String']>
  description_isNull?: Maybe<Scalars['Boolean']>
  description_eq?: Maybe<Scalars['String']>
  description_not_eq?: Maybe<Scalars['String']>
  description_gt?: Maybe<Scalars['String']>
  description_gte?: Maybe<Scalars['String']>
  description_lt?: Maybe<Scalars['String']>
  description_lte?: Maybe<Scalars['String']>
  description_in?: Maybe<Array<Scalars['String']>>
  description_not_in?: Maybe<Array<Scalars['String']>>
  description_contains?: Maybe<Scalars['String']>
  description_not_contains?: Maybe<Scalars['String']>
  description_containsInsensitive?: Maybe<Scalars['String']>
  description_not_containsInsensitive?: Maybe<Scalars['String']>
  description_startsWith?: Maybe<Scalars['String']>
  description_not_startsWith?: Maybe<Scalars['String']>
  description_endsWith?: Maybe<Scalars['String']>
  description_not_endsWith?: Maybe<Scalars['String']>
  areas_isNull?: Maybe<Scalars['Boolean']>
  latencyTestTargets_isNull?: Maybe<Scalars['Boolean']>
  latencyTestTargets_containsAll?: Maybe<Array<Maybe<Scalars['String']>>>
  latencyTestTargets_containsAny?: Maybe<Array<Maybe<Scalars['String']>>>
  latencyTestTargets_containsNone?: Maybe<Array<Maybe<Scalars['String']>>>
  AND?: Maybe<Array<DistributionBucketFamilyMetadataWhereInput>>
  OR?: Maybe<Array<DistributionBucketFamilyMetadataWhereInput>>
}

export enum DistributionBucketFamilyOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  MetadataIdAsc = 'metadata_id_ASC',
  MetadataIdDesc = 'metadata_id_DESC',
  MetadataRegionAsc = 'metadata_region_ASC',
  MetadataRegionDesc = 'metadata_region_DESC',
  MetadataDescriptionAsc = 'metadata_description_ASC',
  MetadataDescriptionDesc = 'metadata_description_DESC',
}

export type DistributionBucketFamilyWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  metadata_isNull?: Maybe<Scalars['Boolean']>
  metadata?: Maybe<DistributionBucketFamilyMetadataWhereInput>
  buckets_every?: Maybe<DistributionBucketWhereInput>
  buckets_some?: Maybe<DistributionBucketWhereInput>
  buckets_none?: Maybe<DistributionBucketWhereInput>
  AND?: Maybe<Array<DistributionBucketFamilyWhereInput>>
  OR?: Maybe<Array<DistributionBucketFamilyWhereInput>>
}

export type DistributionBucketOperator = {
  /** {bucketId}-{workerId} */
  id: Scalars['String']
  /** Related distirbution bucket */
  distributionBucket: DistributionBucket
  /** ID of the distribution group worker */
  workerId: Scalars['Int']
  /** Current operator status */
  status: DistributionBucketOperatorStatus
  /** Operator metadata */
  metadata?: Maybe<DistributionBucketOperatorMetadata>
}

export type DistributionBucketOperatorEdge = {
  node: DistributionBucketOperator
  cursor: Scalars['String']
}

export type DistributionBucketOperatorMetadata = {
  id: Scalars['String']
  /** Distribution bucket operator */
  distirbutionBucketOperator: DistributionBucketOperator
  /** Root distributor node api endpoint */
  nodeEndpoint?: Maybe<Scalars['String']>
  /** Optional node location metadata */
  nodeLocation?: Maybe<NodeLocationMetadata>
  /** Additional information about the node/operator */
  extra?: Maybe<Scalars['String']>
}

export type DistributionBucketOperatorMetadataConnection = {
  edges: Array<DistributionBucketOperatorMetadataEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type DistributionBucketOperatorMetadataEdge = {
  node: DistributionBucketOperatorMetadata
  cursor: Scalars['String']
}

export enum DistributionBucketOperatorMetadataOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  DistirbutionBucketOperatorIdAsc = 'distirbutionBucketOperator_id_ASC',
  DistirbutionBucketOperatorIdDesc = 'distirbutionBucketOperator_id_DESC',
  DistirbutionBucketOperatorWorkerIdAsc = 'distirbutionBucketOperator_workerId_ASC',
  DistirbutionBucketOperatorWorkerIdDesc = 'distirbutionBucketOperator_workerId_DESC',
  DistirbutionBucketOperatorStatusAsc = 'distirbutionBucketOperator_status_ASC',
  DistirbutionBucketOperatorStatusDesc = 'distirbutionBucketOperator_status_DESC',
  NodeEndpointAsc = 'nodeEndpoint_ASC',
  NodeEndpointDesc = 'nodeEndpoint_DESC',
  NodeLocationCountryCodeAsc = 'nodeLocation_countryCode_ASC',
  NodeLocationCountryCodeDesc = 'nodeLocation_countryCode_DESC',
  NodeLocationCityAsc = 'nodeLocation_city_ASC',
  NodeLocationCityDesc = 'nodeLocation_city_DESC',
  ExtraAsc = 'extra_ASC',
  ExtraDesc = 'extra_DESC',
}

export type DistributionBucketOperatorMetadataWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  distirbutionBucketOperator_isNull?: Maybe<Scalars['Boolean']>
  distirbutionBucketOperator?: Maybe<DistributionBucketOperatorWhereInput>
  nodeEndpoint_isNull?: Maybe<Scalars['Boolean']>
  nodeEndpoint_eq?: Maybe<Scalars['String']>
  nodeEndpoint_not_eq?: Maybe<Scalars['String']>
  nodeEndpoint_gt?: Maybe<Scalars['String']>
  nodeEndpoint_gte?: Maybe<Scalars['String']>
  nodeEndpoint_lt?: Maybe<Scalars['String']>
  nodeEndpoint_lte?: Maybe<Scalars['String']>
  nodeEndpoint_in?: Maybe<Array<Scalars['String']>>
  nodeEndpoint_not_in?: Maybe<Array<Scalars['String']>>
  nodeEndpoint_contains?: Maybe<Scalars['String']>
  nodeEndpoint_not_contains?: Maybe<Scalars['String']>
  nodeEndpoint_containsInsensitive?: Maybe<Scalars['String']>
  nodeEndpoint_not_containsInsensitive?: Maybe<Scalars['String']>
  nodeEndpoint_startsWith?: Maybe<Scalars['String']>
  nodeEndpoint_not_startsWith?: Maybe<Scalars['String']>
  nodeEndpoint_endsWith?: Maybe<Scalars['String']>
  nodeEndpoint_not_endsWith?: Maybe<Scalars['String']>
  nodeLocation_isNull?: Maybe<Scalars['Boolean']>
  nodeLocation?: Maybe<NodeLocationMetadataWhereInput>
  extra_isNull?: Maybe<Scalars['Boolean']>
  extra_eq?: Maybe<Scalars['String']>
  extra_not_eq?: Maybe<Scalars['String']>
  extra_gt?: Maybe<Scalars['String']>
  extra_gte?: Maybe<Scalars['String']>
  extra_lt?: Maybe<Scalars['String']>
  extra_lte?: Maybe<Scalars['String']>
  extra_in?: Maybe<Array<Scalars['String']>>
  extra_not_in?: Maybe<Array<Scalars['String']>>
  extra_contains?: Maybe<Scalars['String']>
  extra_not_contains?: Maybe<Scalars['String']>
  extra_containsInsensitive?: Maybe<Scalars['String']>
  extra_not_containsInsensitive?: Maybe<Scalars['String']>
  extra_startsWith?: Maybe<Scalars['String']>
  extra_not_startsWith?: Maybe<Scalars['String']>
  extra_endsWith?: Maybe<Scalars['String']>
  extra_not_endsWith?: Maybe<Scalars['String']>
  AND?: Maybe<Array<DistributionBucketOperatorMetadataWhereInput>>
  OR?: Maybe<Array<DistributionBucketOperatorMetadataWhereInput>>
}

export enum DistributionBucketOperatorOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  DistributionBucketIdAsc = 'distributionBucket_id_ASC',
  DistributionBucketIdDesc = 'distributionBucket_id_DESC',
  DistributionBucketBucketIndexAsc = 'distributionBucket_bucketIndex_ASC',
  DistributionBucketBucketIndexDesc = 'distributionBucket_bucketIndex_DESC',
  DistributionBucketAcceptingNewBagsAsc = 'distributionBucket_acceptingNewBags_ASC',
  DistributionBucketAcceptingNewBagsDesc = 'distributionBucket_acceptingNewBags_DESC',
  DistributionBucketDistributingAsc = 'distributionBucket_distributing_ASC',
  DistributionBucketDistributingDesc = 'distributionBucket_distributing_DESC',
  WorkerIdAsc = 'workerId_ASC',
  WorkerIdDesc = 'workerId_DESC',
  StatusAsc = 'status_ASC',
  StatusDesc = 'status_DESC',
  MetadataIdAsc = 'metadata_id_ASC',
  MetadataIdDesc = 'metadata_id_DESC',
  MetadataNodeEndpointAsc = 'metadata_nodeEndpoint_ASC',
  MetadataNodeEndpointDesc = 'metadata_nodeEndpoint_DESC',
  MetadataExtraAsc = 'metadata_extra_ASC',
  MetadataExtraDesc = 'metadata_extra_DESC',
}

export enum DistributionBucketOperatorStatus {
  Invited = 'INVITED',
  Active = 'ACTIVE',
}

export type DistributionBucketOperatorWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  distributionBucket_isNull?: Maybe<Scalars['Boolean']>
  distributionBucket?: Maybe<DistributionBucketWhereInput>
  workerId_isNull?: Maybe<Scalars['Boolean']>
  workerId_eq?: Maybe<Scalars['Int']>
  workerId_not_eq?: Maybe<Scalars['Int']>
  workerId_gt?: Maybe<Scalars['Int']>
  workerId_gte?: Maybe<Scalars['Int']>
  workerId_lt?: Maybe<Scalars['Int']>
  workerId_lte?: Maybe<Scalars['Int']>
  workerId_in?: Maybe<Array<Scalars['Int']>>
  workerId_not_in?: Maybe<Array<Scalars['Int']>>
  status_isNull?: Maybe<Scalars['Boolean']>
  status_eq?: Maybe<DistributionBucketOperatorStatus>
  status_not_eq?: Maybe<DistributionBucketOperatorStatus>
  status_in?: Maybe<Array<DistributionBucketOperatorStatus>>
  status_not_in?: Maybe<Array<DistributionBucketOperatorStatus>>
  metadata_isNull?: Maybe<Scalars['Boolean']>
  metadata?: Maybe<DistributionBucketOperatorMetadataWhereInput>
  AND?: Maybe<Array<DistributionBucketOperatorWhereInput>>
  OR?: Maybe<Array<DistributionBucketOperatorWhereInput>>
}

export type DistributionBucketOperatorsConnection = {
  edges: Array<DistributionBucketOperatorEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export enum DistributionBucketOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  FamilyIdAsc = 'family_id_ASC',
  FamilyIdDesc = 'family_id_DESC',
  BucketIndexAsc = 'bucketIndex_ASC',
  BucketIndexDesc = 'bucketIndex_DESC',
  AcceptingNewBagsAsc = 'acceptingNewBags_ASC',
  AcceptingNewBagsDesc = 'acceptingNewBags_DESC',
  DistributingAsc = 'distributing_ASC',
  DistributingDesc = 'distributing_DESC',
}

export type DistributionBucketWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  family_isNull?: Maybe<Scalars['Boolean']>
  family?: Maybe<DistributionBucketFamilyWhereInput>
  bucketIndex_isNull?: Maybe<Scalars['Boolean']>
  bucketIndex_eq?: Maybe<Scalars['Int']>
  bucketIndex_not_eq?: Maybe<Scalars['Int']>
  bucketIndex_gt?: Maybe<Scalars['Int']>
  bucketIndex_gte?: Maybe<Scalars['Int']>
  bucketIndex_lt?: Maybe<Scalars['Int']>
  bucketIndex_lte?: Maybe<Scalars['Int']>
  bucketIndex_in?: Maybe<Array<Scalars['Int']>>
  bucketIndex_not_in?: Maybe<Array<Scalars['Int']>>
  operators_every?: Maybe<DistributionBucketOperatorWhereInput>
  operators_some?: Maybe<DistributionBucketOperatorWhereInput>
  operators_none?: Maybe<DistributionBucketOperatorWhereInput>
  acceptingNewBags_isNull?: Maybe<Scalars['Boolean']>
  acceptingNewBags_eq?: Maybe<Scalars['Boolean']>
  acceptingNewBags_not_eq?: Maybe<Scalars['Boolean']>
  distributing_isNull?: Maybe<Scalars['Boolean']>
  distributing_eq?: Maybe<Scalars['Boolean']>
  distributing_not_eq?: Maybe<Scalars['Boolean']>
  bags_every?: Maybe<DistributionBucketBagWhereInput>
  bags_some?: Maybe<DistributionBucketBagWhereInput>
  bags_none?: Maybe<DistributionBucketBagWhereInput>
  AND?: Maybe<Array<DistributionBucketWhereInput>>
  OR?: Maybe<Array<DistributionBucketWhereInput>>
}

export type DistributionBucketsConnection = {
  edges: Array<DistributionBucketEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type EmailDeliveryAttempt = {
  /** UUID */
  id: Scalars['String']
  /** notification Fk */
  notificationDelivery: NotificationEmailDelivery
  /** delivery status */
  status: DeliveryStatus
  /** datetime */
  timestamp: Scalars['DateTime']
}

export type EmailDeliveryAttemptEdge = {
  node: EmailDeliveryAttempt
  cursor: Scalars['String']
}

export enum EmailDeliveryAttemptOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  NotificationDeliveryIdAsc = 'notificationDelivery_id_ASC',
  NotificationDeliveryIdDesc = 'notificationDelivery_id_DESC',
  NotificationDeliveryDiscardAsc = 'notificationDelivery_discard_ASC',
  NotificationDeliveryDiscardDesc = 'notificationDelivery_discard_DESC',
  StatusPhantomAsc = 'status_phantom_ASC',
  StatusPhantomDesc = 'status_phantom_DESC',
  StatusErrorStatusAsc = 'status_errorStatus_ASC',
  StatusErrorStatusDesc = 'status_errorStatus_DESC',
  StatusIsTypeOfAsc = 'status_isTypeOf_ASC',
  StatusIsTypeOfDesc = 'status_isTypeOf_DESC',
  TimestampAsc = 'timestamp_ASC',
  TimestampDesc = 'timestamp_DESC',
}

export type EmailDeliveryAttemptWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  notificationDelivery_isNull?: Maybe<Scalars['Boolean']>
  notificationDelivery?: Maybe<NotificationEmailDeliveryWhereInput>
  status_isNull?: Maybe<Scalars['Boolean']>
  status?: Maybe<DeliveryStatusWhereInput>
  timestamp_isNull?: Maybe<Scalars['Boolean']>
  timestamp_eq?: Maybe<Scalars['DateTime']>
  timestamp_not_eq?: Maybe<Scalars['DateTime']>
  timestamp_gt?: Maybe<Scalars['DateTime']>
  timestamp_gte?: Maybe<Scalars['DateTime']>
  timestamp_lt?: Maybe<Scalars['DateTime']>
  timestamp_lte?: Maybe<Scalars['DateTime']>
  timestamp_in?: Maybe<Array<Scalars['DateTime']>>
  timestamp_not_in?: Maybe<Array<Scalars['DateTime']>>
  AND?: Maybe<Array<EmailDeliveryAttemptWhereInput>>
  OR?: Maybe<Array<EmailDeliveryAttemptWhereInput>>
}

export type EmailDeliveryAttemptsConnection = {
  edges: Array<EmailDeliveryAttemptEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type EmailFailure = {
  errorStatus: Scalars['String']
}

export type EmailSuccess = {
  phantom?: Maybe<Scalars['Int']>
}

export type EncryptionArtifacts = {
  /** ID / lookupKey */
  id: Scalars['String']
  /** The account the encryption artifacts are associated with */
  account: Account
  /** The IV used to encrypt the wallet seed with user credentials */
  cipherIv: Scalars['String']
  /** Wallet seed encrypted with user credentials */
  encryptedSeed: Scalars['String']
}

export type EncryptionArtifactsConnection = {
  edges: Array<EncryptionArtifactsEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type EncryptionArtifactsEdge = {
  node: EncryptionArtifacts
  cursor: Scalars['String']
}

export enum EncryptionArtifactsOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  AccountIdAsc = 'account_id_ASC',
  AccountIdDesc = 'account_id_DESC',
  AccountEmailAsc = 'account_email_ASC',
  AccountEmailDesc = 'account_email_DESC',
  AccountIsEmailConfirmedAsc = 'account_isEmailConfirmed_ASC',
  AccountIsEmailConfirmedDesc = 'account_isEmailConfirmed_DESC',
  AccountIsBlockedAsc = 'account_isBlocked_ASC',
  AccountIsBlockedDesc = 'account_isBlocked_DESC',
  AccountRegisteredAtAsc = 'account_registeredAt_ASC',
  AccountRegisteredAtDesc = 'account_registeredAt_DESC',
  AccountJoystreamAccountAsc = 'account_joystreamAccount_ASC',
  AccountJoystreamAccountDesc = 'account_joystreamAccount_DESC',
  AccountReferrerChannelIdAsc = 'account_referrerChannelId_ASC',
  AccountReferrerChannelIdDesc = 'account_referrerChannelId_DESC',
  CipherIvAsc = 'cipherIv_ASC',
  CipherIvDesc = 'cipherIv_DESC',
  EncryptedSeedAsc = 'encryptedSeed_ASC',
  EncryptedSeedDesc = 'encryptedSeed_DESC',
}

export type EncryptionArtifactsWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  account_isNull?: Maybe<Scalars['Boolean']>
  account?: Maybe<AccountWhereInput>
  cipherIv_isNull?: Maybe<Scalars['Boolean']>
  cipherIv_eq?: Maybe<Scalars['String']>
  cipherIv_not_eq?: Maybe<Scalars['String']>
  cipherIv_gt?: Maybe<Scalars['String']>
  cipherIv_gte?: Maybe<Scalars['String']>
  cipherIv_lt?: Maybe<Scalars['String']>
  cipherIv_lte?: Maybe<Scalars['String']>
  cipherIv_in?: Maybe<Array<Scalars['String']>>
  cipherIv_not_in?: Maybe<Array<Scalars['String']>>
  cipherIv_contains?: Maybe<Scalars['String']>
  cipherIv_not_contains?: Maybe<Scalars['String']>
  cipherIv_containsInsensitive?: Maybe<Scalars['String']>
  cipherIv_not_containsInsensitive?: Maybe<Scalars['String']>
  cipherIv_startsWith?: Maybe<Scalars['String']>
  cipherIv_not_startsWith?: Maybe<Scalars['String']>
  cipherIv_endsWith?: Maybe<Scalars['String']>
  cipherIv_not_endsWith?: Maybe<Scalars['String']>
  encryptedSeed_isNull?: Maybe<Scalars['Boolean']>
  encryptedSeed_eq?: Maybe<Scalars['String']>
  encryptedSeed_not_eq?: Maybe<Scalars['String']>
  encryptedSeed_gt?: Maybe<Scalars['String']>
  encryptedSeed_gte?: Maybe<Scalars['String']>
  encryptedSeed_lt?: Maybe<Scalars['String']>
  encryptedSeed_lte?: Maybe<Scalars['String']>
  encryptedSeed_in?: Maybe<Array<Scalars['String']>>
  encryptedSeed_not_in?: Maybe<Array<Scalars['String']>>
  encryptedSeed_contains?: Maybe<Scalars['String']>
  encryptedSeed_not_contains?: Maybe<Scalars['String']>
  encryptedSeed_containsInsensitive?: Maybe<Scalars['String']>
  encryptedSeed_not_containsInsensitive?: Maybe<Scalars['String']>
  encryptedSeed_startsWith?: Maybe<Scalars['String']>
  encryptedSeed_not_startsWith?: Maybe<Scalars['String']>
  encryptedSeed_endsWith?: Maybe<Scalars['String']>
  encryptedSeed_not_endsWith?: Maybe<Scalars['String']>
  AND?: Maybe<Array<EncryptionArtifactsWhereInput>>
  OR?: Maybe<Array<EncryptionArtifactsWhereInput>>
}

export type EnglishAuctionSettledEventData = {
  /** English auction winning bid */
  winningBid: Bid
  /** NFT owner before the english auction was settled */
  previousNftOwner: NftOwner
}

export type EnglishAuctionStartedEventData = {
  /** Actor that started this auction. */
  actor: ContentActor
  /** owner of the NFT being auctioned */
  nftOwner: NftOwner
  /** Auction started. */
  auction: Auction
}

export type EntityReportInfo = {
  id: Scalars['String']
  rationale: Scalars['String']
  createdAt: Scalars['DateTime']
  created: Scalars['Boolean']
}

export type Event = {
  /** {blockNumber}-{indexInBlock} */
  id: Scalars['String']
  /** Blocknumber of the block in which the event was emitted. */
  inBlock: Scalars['Int']
  /** Hash of the extrinsic the event was emitted in */
  inExtrinsic?: Maybe<Scalars['String']>
  /** Index of event in block from which it was emitted. */
  indexInBlock: Scalars['Int']
  /** Timestamp of the block the event was emitted in */
  timestamp: Scalars['DateTime']
  /** More specific event data, which depends on event type */
  data: EventData
}

export type EventData =
  | ChannelCreatedEventData
  | VideoCreatedEventData
  | CommentCreatedEventData
  | CommentReactionEventData
  | CommentTextUpdatedEventData
  | OpenAuctionStartedEventData
  | EnglishAuctionStartedEventData
  | NftIssuedEventData
  | NftOfferedEventData
  | AuctionBidMadeEventData
  | AuctionBidCanceledEventData
  | AuctionCanceledEventData
  | EnglishAuctionSettledEventData
  | BidMadeCompletingAuctionEventData
  | OpenAuctionBidAcceptedEventData
  | NftSellOrderMadeEventData
  | NftBoughtEventData
  | BuyNowCanceledEventData
  | BuyNowPriceUpdatedEventData
  | MetaprotocolTransactionStatusEventData
  | ChannelRewardClaimedEventData
  | ChannelRewardClaimedAndWithdrawnEventData
  | ChannelFundsWithdrawnEventData
  | ChannelPayoutsUpdatedEventData
  | ChannelPaymentMadeEventData
  | MemberBannedFromChannelEventData
  | VideoReactionEventData

export type EventDataWhereInput = {
  channel_isNull?: Maybe<Scalars['Boolean']>
  channel?: Maybe<ChannelWhereInput>
  video_isNull?: Maybe<Scalars['Boolean']>
  video?: Maybe<VideoWhereInput>
  comment_isNull?: Maybe<Scalars['Boolean']>
  comment?: Maybe<CommentWhereInput>
  text_isNull?: Maybe<Scalars['Boolean']>
  text_eq?: Maybe<Scalars['String']>
  text_not_eq?: Maybe<Scalars['String']>
  text_gt?: Maybe<Scalars['String']>
  text_gte?: Maybe<Scalars['String']>
  text_lt?: Maybe<Scalars['String']>
  text_lte?: Maybe<Scalars['String']>
  text_in?: Maybe<Array<Scalars['String']>>
  text_not_in?: Maybe<Array<Scalars['String']>>
  text_contains?: Maybe<Scalars['String']>
  text_not_contains?: Maybe<Scalars['String']>
  text_containsInsensitive?: Maybe<Scalars['String']>
  text_not_containsInsensitive?: Maybe<Scalars['String']>
  text_startsWith?: Maybe<Scalars['String']>
  text_not_startsWith?: Maybe<Scalars['String']>
  text_endsWith?: Maybe<Scalars['String']>
  text_not_endsWith?: Maybe<Scalars['String']>
  commentReaction_isNull?: Maybe<Scalars['Boolean']>
  commentReaction?: Maybe<CommentReactionWhereInput>
  newText_isNull?: Maybe<Scalars['Boolean']>
  newText_eq?: Maybe<Scalars['String']>
  newText_not_eq?: Maybe<Scalars['String']>
  newText_gt?: Maybe<Scalars['String']>
  newText_gte?: Maybe<Scalars['String']>
  newText_lt?: Maybe<Scalars['String']>
  newText_lte?: Maybe<Scalars['String']>
  newText_in?: Maybe<Array<Scalars['String']>>
  newText_not_in?: Maybe<Array<Scalars['String']>>
  newText_contains?: Maybe<Scalars['String']>
  newText_not_contains?: Maybe<Scalars['String']>
  newText_containsInsensitive?: Maybe<Scalars['String']>
  newText_not_containsInsensitive?: Maybe<Scalars['String']>
  newText_startsWith?: Maybe<Scalars['String']>
  newText_not_startsWith?: Maybe<Scalars['String']>
  newText_endsWith?: Maybe<Scalars['String']>
  newText_not_endsWith?: Maybe<Scalars['String']>
  actor_isNull?: Maybe<Scalars['Boolean']>
  actor?: Maybe<ContentActorWhereInput>
  auction_isNull?: Maybe<Scalars['Boolean']>
  auction?: Maybe<AuctionWhereInput>
  nftOwner_isNull?: Maybe<Scalars['Boolean']>
  nftOwner?: Maybe<NftOwnerWhereInput>
  nft_isNull?: Maybe<Scalars['Boolean']>
  nft?: Maybe<OwnedNftWhereInput>
  bid_isNull?: Maybe<Scalars['Boolean']>
  bid?: Maybe<BidWhereInput>
  member_isNull?: Maybe<Scalars['Boolean']>
  member?: Maybe<MembershipWhereInput>
  winningBid_isNull?: Maybe<Scalars['Boolean']>
  winningBid?: Maybe<BidWhereInput>
  previousNftOwner_isNull?: Maybe<Scalars['Boolean']>
  previousNftOwner?: Maybe<NftOwnerWhereInput>
  price_isNull?: Maybe<Scalars['Boolean']>
  price_eq?: Maybe<Scalars['BigInt']>
  price_not_eq?: Maybe<Scalars['BigInt']>
  price_gt?: Maybe<Scalars['BigInt']>
  price_gte?: Maybe<Scalars['BigInt']>
  price_lt?: Maybe<Scalars['BigInt']>
  price_lte?: Maybe<Scalars['BigInt']>
  price_in?: Maybe<Array<Scalars['BigInt']>>
  price_not_in?: Maybe<Array<Scalars['BigInt']>>
  buyer_isNull?: Maybe<Scalars['Boolean']>
  buyer?: Maybe<MembershipWhereInput>
  newPrice_isNull?: Maybe<Scalars['Boolean']>
  newPrice_eq?: Maybe<Scalars['BigInt']>
  newPrice_not_eq?: Maybe<Scalars['BigInt']>
  newPrice_gt?: Maybe<Scalars['BigInt']>
  newPrice_gte?: Maybe<Scalars['BigInt']>
  newPrice_lt?: Maybe<Scalars['BigInt']>
  newPrice_lte?: Maybe<Scalars['BigInt']>
  newPrice_in?: Maybe<Array<Scalars['BigInt']>>
  newPrice_not_in?: Maybe<Array<Scalars['BigInt']>>
  result_isNull?: Maybe<Scalars['Boolean']>
  result?: Maybe<MetaprotocolTransactionResultWhereInput>
  amount_isNull?: Maybe<Scalars['Boolean']>
  amount_eq?: Maybe<Scalars['BigInt']>
  amount_not_eq?: Maybe<Scalars['BigInt']>
  amount_gt?: Maybe<Scalars['BigInt']>
  amount_gte?: Maybe<Scalars['BigInt']>
  amount_lt?: Maybe<Scalars['BigInt']>
  amount_lte?: Maybe<Scalars['BigInt']>
  amount_in?: Maybe<Array<Scalars['BigInt']>>
  amount_not_in?: Maybe<Array<Scalars['BigInt']>>
  account_isNull?: Maybe<Scalars['Boolean']>
  account_eq?: Maybe<Scalars['String']>
  account_not_eq?: Maybe<Scalars['String']>
  account_gt?: Maybe<Scalars['String']>
  account_gte?: Maybe<Scalars['String']>
  account_lt?: Maybe<Scalars['String']>
  account_lte?: Maybe<Scalars['String']>
  account_in?: Maybe<Array<Scalars['String']>>
  account_not_in?: Maybe<Array<Scalars['String']>>
  account_contains?: Maybe<Scalars['String']>
  account_not_contains?: Maybe<Scalars['String']>
  account_containsInsensitive?: Maybe<Scalars['String']>
  account_not_containsInsensitive?: Maybe<Scalars['String']>
  account_startsWith?: Maybe<Scalars['String']>
  account_not_startsWith?: Maybe<Scalars['String']>
  account_endsWith?: Maybe<Scalars['String']>
  account_not_endsWith?: Maybe<Scalars['String']>
  commitment_isNull?: Maybe<Scalars['Boolean']>
  commitment_eq?: Maybe<Scalars['String']>
  commitment_not_eq?: Maybe<Scalars['String']>
  commitment_gt?: Maybe<Scalars['String']>
  commitment_gte?: Maybe<Scalars['String']>
  commitment_lt?: Maybe<Scalars['String']>
  commitment_lte?: Maybe<Scalars['String']>
  commitment_in?: Maybe<Array<Scalars['String']>>
  commitment_not_in?: Maybe<Array<Scalars['String']>>
  commitment_contains?: Maybe<Scalars['String']>
  commitment_not_contains?: Maybe<Scalars['String']>
  commitment_containsInsensitive?: Maybe<Scalars['String']>
  commitment_not_containsInsensitive?: Maybe<Scalars['String']>
  commitment_startsWith?: Maybe<Scalars['String']>
  commitment_not_startsWith?: Maybe<Scalars['String']>
  commitment_endsWith?: Maybe<Scalars['String']>
  commitment_not_endsWith?: Maybe<Scalars['String']>
  payloadDataObject_isNull?: Maybe<Scalars['Boolean']>
  payloadDataObject?: Maybe<StorageDataObjectWhereInput>
  minCashoutAllowed_isNull?: Maybe<Scalars['Boolean']>
  minCashoutAllowed_eq?: Maybe<Scalars['BigInt']>
  minCashoutAllowed_not_eq?: Maybe<Scalars['BigInt']>
  minCashoutAllowed_gt?: Maybe<Scalars['BigInt']>
  minCashoutAllowed_gte?: Maybe<Scalars['BigInt']>
  minCashoutAllowed_lt?: Maybe<Scalars['BigInt']>
  minCashoutAllowed_lte?: Maybe<Scalars['BigInt']>
  minCashoutAllowed_in?: Maybe<Array<Scalars['BigInt']>>
  minCashoutAllowed_not_in?: Maybe<Array<Scalars['BigInt']>>
  maxCashoutAllowed_isNull?: Maybe<Scalars['Boolean']>
  maxCashoutAllowed_eq?: Maybe<Scalars['BigInt']>
  maxCashoutAllowed_not_eq?: Maybe<Scalars['BigInt']>
  maxCashoutAllowed_gt?: Maybe<Scalars['BigInt']>
  maxCashoutAllowed_gte?: Maybe<Scalars['BigInt']>
  maxCashoutAllowed_lt?: Maybe<Scalars['BigInt']>
  maxCashoutAllowed_lte?: Maybe<Scalars['BigInt']>
  maxCashoutAllowed_in?: Maybe<Array<Scalars['BigInt']>>
  maxCashoutAllowed_not_in?: Maybe<Array<Scalars['BigInt']>>
  channelCashoutsEnabled_isNull?: Maybe<Scalars['Boolean']>
  channelCashoutsEnabled_eq?: Maybe<Scalars['Boolean']>
  channelCashoutsEnabled_not_eq?: Maybe<Scalars['Boolean']>
  payer_isNull?: Maybe<Scalars['Boolean']>
  payer?: Maybe<MembershipWhereInput>
  paymentContext_isNull?: Maybe<Scalars['Boolean']>
  paymentContext?: Maybe<PaymentContextWhereInput>
  payeeChannel_isNull?: Maybe<Scalars['Boolean']>
  payeeChannel?: Maybe<ChannelWhereInput>
  rationale_isNull?: Maybe<Scalars['Boolean']>
  rationale_eq?: Maybe<Scalars['String']>
  rationale_not_eq?: Maybe<Scalars['String']>
  rationale_gt?: Maybe<Scalars['String']>
  rationale_gte?: Maybe<Scalars['String']>
  rationale_lt?: Maybe<Scalars['String']>
  rationale_lte?: Maybe<Scalars['String']>
  rationale_in?: Maybe<Array<Scalars['String']>>
  rationale_not_in?: Maybe<Array<Scalars['String']>>
  rationale_contains?: Maybe<Scalars['String']>
  rationale_not_contains?: Maybe<Scalars['String']>
  rationale_containsInsensitive?: Maybe<Scalars['String']>
  rationale_not_containsInsensitive?: Maybe<Scalars['String']>
  rationale_startsWith?: Maybe<Scalars['String']>
  rationale_not_startsWith?: Maybe<Scalars['String']>
  rationale_endsWith?: Maybe<Scalars['String']>
  rationale_not_endsWith?: Maybe<Scalars['String']>
  action_isNull?: Maybe<Scalars['Boolean']>
  action_eq?: Maybe<Scalars['Boolean']>
  action_not_eq?: Maybe<Scalars['Boolean']>
  videoReaction_isNull?: Maybe<Scalars['Boolean']>
  videoReaction?: Maybe<VideoReactionWhereInput>
  isTypeOf_isNull?: Maybe<Scalars['Boolean']>
  isTypeOf_eq?: Maybe<Scalars['String']>
  isTypeOf_not_eq?: Maybe<Scalars['String']>
  isTypeOf_gt?: Maybe<Scalars['String']>
  isTypeOf_gte?: Maybe<Scalars['String']>
  isTypeOf_lt?: Maybe<Scalars['String']>
  isTypeOf_lte?: Maybe<Scalars['String']>
  isTypeOf_in?: Maybe<Array<Scalars['String']>>
  isTypeOf_not_in?: Maybe<Array<Scalars['String']>>
  isTypeOf_contains?: Maybe<Scalars['String']>
  isTypeOf_not_contains?: Maybe<Scalars['String']>
  isTypeOf_containsInsensitive?: Maybe<Scalars['String']>
  isTypeOf_not_containsInsensitive?: Maybe<Scalars['String']>
  isTypeOf_startsWith?: Maybe<Scalars['String']>
  isTypeOf_not_startsWith?: Maybe<Scalars['String']>
  isTypeOf_endsWith?: Maybe<Scalars['String']>
  isTypeOf_not_endsWith?: Maybe<Scalars['String']>
}

export type EventEdge = {
  node: Event
  cursor: Scalars['String']
}

export enum EventOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  InBlockAsc = 'inBlock_ASC',
  InBlockDesc = 'inBlock_DESC',
  InExtrinsicAsc = 'inExtrinsic_ASC',
  InExtrinsicDesc = 'inExtrinsic_DESC',
  IndexInBlockAsc = 'indexInBlock_ASC',
  IndexInBlockDesc = 'indexInBlock_DESC',
  TimestampAsc = 'timestamp_ASC',
  TimestampDesc = 'timestamp_DESC',
  DataTextAsc = 'data_text_ASC',
  DataTextDesc = 'data_text_DESC',
  DataNewTextAsc = 'data_newText_ASC',
  DataNewTextDesc = 'data_newText_DESC',
  DataPriceAsc = 'data_price_ASC',
  DataPriceDesc = 'data_price_DESC',
  DataNewPriceAsc = 'data_newPrice_ASC',
  DataNewPriceDesc = 'data_newPrice_DESC',
  DataAmountAsc = 'data_amount_ASC',
  DataAmountDesc = 'data_amount_DESC',
  DataAccountAsc = 'data_account_ASC',
  DataAccountDesc = 'data_account_DESC',
  DataCommitmentAsc = 'data_commitment_ASC',
  DataCommitmentDesc = 'data_commitment_DESC',
  DataMinCashoutAllowedAsc = 'data_minCashoutAllowed_ASC',
  DataMinCashoutAllowedDesc = 'data_minCashoutAllowed_DESC',
  DataMaxCashoutAllowedAsc = 'data_maxCashoutAllowed_ASC',
  DataMaxCashoutAllowedDesc = 'data_maxCashoutAllowed_DESC',
  DataChannelCashoutsEnabledAsc = 'data_channelCashoutsEnabled_ASC',
  DataChannelCashoutsEnabledDesc = 'data_channelCashoutsEnabled_DESC',
  DataRationaleAsc = 'data_rationale_ASC',
  DataRationaleDesc = 'data_rationale_DESC',
  DataActionAsc = 'data_action_ASC',
  DataActionDesc = 'data_action_DESC',
  DataIsTypeOfAsc = 'data_isTypeOf_ASC',
  DataIsTypeOfDesc = 'data_isTypeOf_DESC',
}

export type EventWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  inBlock_isNull?: Maybe<Scalars['Boolean']>
  inBlock_eq?: Maybe<Scalars['Int']>
  inBlock_not_eq?: Maybe<Scalars['Int']>
  inBlock_gt?: Maybe<Scalars['Int']>
  inBlock_gte?: Maybe<Scalars['Int']>
  inBlock_lt?: Maybe<Scalars['Int']>
  inBlock_lte?: Maybe<Scalars['Int']>
  inBlock_in?: Maybe<Array<Scalars['Int']>>
  inBlock_not_in?: Maybe<Array<Scalars['Int']>>
  inExtrinsic_isNull?: Maybe<Scalars['Boolean']>
  inExtrinsic_eq?: Maybe<Scalars['String']>
  inExtrinsic_not_eq?: Maybe<Scalars['String']>
  inExtrinsic_gt?: Maybe<Scalars['String']>
  inExtrinsic_gte?: Maybe<Scalars['String']>
  inExtrinsic_lt?: Maybe<Scalars['String']>
  inExtrinsic_lte?: Maybe<Scalars['String']>
  inExtrinsic_in?: Maybe<Array<Scalars['String']>>
  inExtrinsic_not_in?: Maybe<Array<Scalars['String']>>
  inExtrinsic_contains?: Maybe<Scalars['String']>
  inExtrinsic_not_contains?: Maybe<Scalars['String']>
  inExtrinsic_containsInsensitive?: Maybe<Scalars['String']>
  inExtrinsic_not_containsInsensitive?: Maybe<Scalars['String']>
  inExtrinsic_startsWith?: Maybe<Scalars['String']>
  inExtrinsic_not_startsWith?: Maybe<Scalars['String']>
  inExtrinsic_endsWith?: Maybe<Scalars['String']>
  inExtrinsic_not_endsWith?: Maybe<Scalars['String']>
  indexInBlock_isNull?: Maybe<Scalars['Boolean']>
  indexInBlock_eq?: Maybe<Scalars['Int']>
  indexInBlock_not_eq?: Maybe<Scalars['Int']>
  indexInBlock_gt?: Maybe<Scalars['Int']>
  indexInBlock_gte?: Maybe<Scalars['Int']>
  indexInBlock_lt?: Maybe<Scalars['Int']>
  indexInBlock_lte?: Maybe<Scalars['Int']>
  indexInBlock_in?: Maybe<Array<Scalars['Int']>>
  indexInBlock_not_in?: Maybe<Array<Scalars['Int']>>
  timestamp_isNull?: Maybe<Scalars['Boolean']>
  timestamp_eq?: Maybe<Scalars['DateTime']>
  timestamp_not_eq?: Maybe<Scalars['DateTime']>
  timestamp_gt?: Maybe<Scalars['DateTime']>
  timestamp_gte?: Maybe<Scalars['DateTime']>
  timestamp_lt?: Maybe<Scalars['DateTime']>
  timestamp_lte?: Maybe<Scalars['DateTime']>
  timestamp_in?: Maybe<Array<Scalars['DateTime']>>
  timestamp_not_in?: Maybe<Array<Scalars['DateTime']>>
  data_isNull?: Maybe<Scalars['Boolean']>
  data?: Maybe<EventDataWhereInput>
  AND?: Maybe<Array<EventWhereInput>>
  OR?: Maybe<Array<EventWhereInput>>
}

export type EventsConnection = {
  edges: Array<EventEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export enum ExcludableContentType {
  Channel = 'Channel',
  Video = 'Video',
  Comment = 'Comment',
}

export type ExcludeChannelResult = {
  id: Scalars['String']
  rationale: Scalars['String']
  createdAt: Scalars['DateTime']
  created: Scalars['Boolean']
  channelId: Scalars['String']
}

export type ExcludeContentResult = {
  numberOfEntitiesAffected: Scalars['Int']
}

export type ExcludeVideoInfo = {
  id: Scalars['String']
  rationale: Scalars['String']
  createdAt: Scalars['DateTime']
  created: Scalars['Boolean']
  videoId: Scalars['String']
}

export type Exclusion = {
  /** Unique identifier of the exclusion */
  id: Scalars['String']
  /** If it's a channel exclusion: ID of the channel being reported (the channel may no longer exist) */
  channelId?: Maybe<Scalars['String']>
  /** If it's a video exclusion: ID of the video being reported (the video may no longer exist) */
  videoId?: Maybe<Scalars['String']>
  /** Time of the exclusion */
  timestamp: Scalars['DateTime']
  /** Rationale behind the exclusion */
  rationale: Scalars['String']
}

export type ExclusionEdge = {
  node: Exclusion
  cursor: Scalars['String']
}

export enum ExclusionOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  ChannelIdAsc = 'channelId_ASC',
  ChannelIdDesc = 'channelId_DESC',
  VideoIdAsc = 'videoId_ASC',
  VideoIdDesc = 'videoId_DESC',
  TimestampAsc = 'timestamp_ASC',
  TimestampDesc = 'timestamp_DESC',
  RationaleAsc = 'rationale_ASC',
  RationaleDesc = 'rationale_DESC',
}

export type ExclusionWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  channelId_isNull?: Maybe<Scalars['Boolean']>
  channelId_eq?: Maybe<Scalars['String']>
  channelId_not_eq?: Maybe<Scalars['String']>
  channelId_gt?: Maybe<Scalars['String']>
  channelId_gte?: Maybe<Scalars['String']>
  channelId_lt?: Maybe<Scalars['String']>
  channelId_lte?: Maybe<Scalars['String']>
  channelId_in?: Maybe<Array<Scalars['String']>>
  channelId_not_in?: Maybe<Array<Scalars['String']>>
  channelId_contains?: Maybe<Scalars['String']>
  channelId_not_contains?: Maybe<Scalars['String']>
  channelId_containsInsensitive?: Maybe<Scalars['String']>
  channelId_not_containsInsensitive?: Maybe<Scalars['String']>
  channelId_startsWith?: Maybe<Scalars['String']>
  channelId_not_startsWith?: Maybe<Scalars['String']>
  channelId_endsWith?: Maybe<Scalars['String']>
  channelId_not_endsWith?: Maybe<Scalars['String']>
  videoId_isNull?: Maybe<Scalars['Boolean']>
  videoId_eq?: Maybe<Scalars['String']>
  videoId_not_eq?: Maybe<Scalars['String']>
  videoId_gt?: Maybe<Scalars['String']>
  videoId_gte?: Maybe<Scalars['String']>
  videoId_lt?: Maybe<Scalars['String']>
  videoId_lte?: Maybe<Scalars['String']>
  videoId_in?: Maybe<Array<Scalars['String']>>
  videoId_not_in?: Maybe<Array<Scalars['String']>>
  videoId_contains?: Maybe<Scalars['String']>
  videoId_not_contains?: Maybe<Scalars['String']>
  videoId_containsInsensitive?: Maybe<Scalars['String']>
  videoId_not_containsInsensitive?: Maybe<Scalars['String']>
  videoId_startsWith?: Maybe<Scalars['String']>
  videoId_not_startsWith?: Maybe<Scalars['String']>
  videoId_endsWith?: Maybe<Scalars['String']>
  videoId_not_endsWith?: Maybe<Scalars['String']>
  timestamp_isNull?: Maybe<Scalars['Boolean']>
  timestamp_eq?: Maybe<Scalars['DateTime']>
  timestamp_not_eq?: Maybe<Scalars['DateTime']>
  timestamp_gt?: Maybe<Scalars['DateTime']>
  timestamp_gte?: Maybe<Scalars['DateTime']>
  timestamp_lt?: Maybe<Scalars['DateTime']>
  timestamp_lte?: Maybe<Scalars['DateTime']>
  timestamp_in?: Maybe<Array<Scalars['DateTime']>>
  timestamp_not_in?: Maybe<Array<Scalars['DateTime']>>
  rationale_isNull?: Maybe<Scalars['Boolean']>
  rationale_eq?: Maybe<Scalars['String']>
  rationale_not_eq?: Maybe<Scalars['String']>
  rationale_gt?: Maybe<Scalars['String']>
  rationale_gte?: Maybe<Scalars['String']>
  rationale_lt?: Maybe<Scalars['String']>
  rationale_lte?: Maybe<Scalars['String']>
  rationale_in?: Maybe<Array<Scalars['String']>>
  rationale_not_in?: Maybe<Array<Scalars['String']>>
  rationale_contains?: Maybe<Scalars['String']>
  rationale_not_contains?: Maybe<Scalars['String']>
  rationale_containsInsensitive?: Maybe<Scalars['String']>
  rationale_not_containsInsensitive?: Maybe<Scalars['String']>
  rationale_startsWith?: Maybe<Scalars['String']>
  rationale_not_startsWith?: Maybe<Scalars['String']>
  rationale_endsWith?: Maybe<Scalars['String']>
  rationale_not_endsWith?: Maybe<Scalars['String']>
  AND?: Maybe<Array<ExclusionWhereInput>>
  OR?: Maybe<Array<ExclusionWhereInput>>
}

export type ExclusionsConnection = {
  edges: Array<ExclusionEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type ExtendedChannel = {
  channel: Channel
  activeVideosCount: Scalars['Int']
}

export type ExtendedChannelWhereInput = {
  channel?: Maybe<ChannelWhereInput>
  activeVideosCount_gt?: Maybe<Scalars['Int']>
}

export type ExtendedVideoCategory = {
  category: VideoCategory
  activeVideosCount: Scalars['Int']
}

export type FeaturedVideoInput = {
  videoId: Scalars['String']
  videoCutUrl?: Maybe<Scalars['String']>
}

export type FollowedChannel = {
  channelId: Scalars['String']
  timestamp: Scalars['String']
}

export type GatewayConfig = {
  /** Unique name of the configuration variable */
  id: Scalars['String']
  /** Value of the configuration variable serialized to a string */
  value: Scalars['String']
  /** Last time the configuration variable was updated */
  updatedAt: Scalars['DateTime']
}

export type GatewayConfigEdge = {
  node: GatewayConfig
  cursor: Scalars['String']
}

export enum GatewayConfigOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  ValueAsc = 'value_ASC',
  ValueDesc = 'value_DESC',
  UpdatedAtAsc = 'updatedAt_ASC',
  UpdatedAtDesc = 'updatedAt_DESC',
}

export type GatewayConfigWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  value_isNull?: Maybe<Scalars['Boolean']>
  value_eq?: Maybe<Scalars['String']>
  value_not_eq?: Maybe<Scalars['String']>
  value_gt?: Maybe<Scalars['String']>
  value_gte?: Maybe<Scalars['String']>
  value_lt?: Maybe<Scalars['String']>
  value_lte?: Maybe<Scalars['String']>
  value_in?: Maybe<Array<Scalars['String']>>
  value_not_in?: Maybe<Array<Scalars['String']>>
  value_contains?: Maybe<Scalars['String']>
  value_not_contains?: Maybe<Scalars['String']>
  value_containsInsensitive?: Maybe<Scalars['String']>
  value_not_containsInsensitive?: Maybe<Scalars['String']>
  value_startsWith?: Maybe<Scalars['String']>
  value_not_startsWith?: Maybe<Scalars['String']>
  value_endsWith?: Maybe<Scalars['String']>
  value_not_endsWith?: Maybe<Scalars['String']>
  updatedAt_isNull?: Maybe<Scalars['Boolean']>
  updatedAt_eq?: Maybe<Scalars['DateTime']>
  updatedAt_not_eq?: Maybe<Scalars['DateTime']>
  updatedAt_gt?: Maybe<Scalars['DateTime']>
  updatedAt_gte?: Maybe<Scalars['DateTime']>
  updatedAt_lt?: Maybe<Scalars['DateTime']>
  updatedAt_lte?: Maybe<Scalars['DateTime']>
  updatedAt_in?: Maybe<Array<Scalars['DateTime']>>
  updatedAt_not_in?: Maybe<Array<Scalars['DateTime']>>
  AND?: Maybe<Array<GatewayConfigWhereInput>>
  OR?: Maybe<Array<GatewayConfigWhereInput>>
}

export type GatewayConfigsConnection = {
  edges: Array<GatewayConfigEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type GeneratedSignature = {
  /** App signature converted to hexadecimal string. */
  signature: Scalars['String']
}

export type GeoCoordinates = {
  latitude: Scalars['Float']
  longitude: Scalars['Float']
}

export type GeoCoordinatesWhereInput = {
  latitude_isNull?: Maybe<Scalars['Boolean']>
  latitude_eq?: Maybe<Scalars['Float']>
  latitude_not_eq?: Maybe<Scalars['Float']>
  latitude_gt?: Maybe<Scalars['Float']>
  latitude_gte?: Maybe<Scalars['Float']>
  latitude_lt?: Maybe<Scalars['Float']>
  latitude_lte?: Maybe<Scalars['Float']>
  latitude_in?: Maybe<Array<Scalars['Float']>>
  latitude_not_in?: Maybe<Array<Scalars['Float']>>
  longitude_isNull?: Maybe<Scalars['Boolean']>
  longitude_eq?: Maybe<Scalars['Float']>
  longitude_not_eq?: Maybe<Scalars['Float']>
  longitude_gt?: Maybe<Scalars['Float']>
  longitude_gte?: Maybe<Scalars['Float']>
  longitude_lt?: Maybe<Scalars['Float']>
  longitude_lte?: Maybe<Scalars['Float']>
  longitude_in?: Maybe<Array<Scalars['Float']>>
  longitude_not_in?: Maybe<Array<Scalars['Float']>>
}

export type GeographicalArea = GeographicalAreaContinent | GeographicalAreaCountry | GeographicalAreaSubdivistion

export type GeographicalAreaContinent = {
  continentCode?: Maybe<Continent>
}

export type GeographicalAreaCountry = {
  /** ISO 3166-1 alpha-2 country code */
  countryCode?: Maybe<Scalars['String']>
}

export type GeographicalAreaSubdivistion = {
  /** ISO 3166-2 subdivision code */
  subdivisionCode?: Maybe<Scalars['String']>
}

export type GrantOrRevokeOperatorPermissionsResult = {
  newPermissions: Array<OperatorPermission>
}

export type HigherBidPlaced = {
  /** video title for notification text */
  videoTitle: Scalars['String']
  /** video Id used for link */
  videoId: Scalars['String']
  /** new bidder id */
  newBidderId: Scalars['String']
  /** new bidder handle */
  newBidderHandle: Scalars['String']
}

export type KillSwitch = {
  isKilled: Scalars['Boolean']
}

export type License = {
  /** Unique identifier */
  id: Scalars['String']
  /** License code defined by Joystream */
  code?: Maybe<Scalars['Int']>
  /** Attribution (if required by the license) */
  attribution?: Maybe<Scalars['String']>
  /** Custom license content */
  customText?: Maybe<Scalars['String']>
}

export type LicenseEdge = {
  node: License
  cursor: Scalars['String']
}

export enum LicenseOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  CodeAsc = 'code_ASC',
  CodeDesc = 'code_DESC',
  AttributionAsc = 'attribution_ASC',
  AttributionDesc = 'attribution_DESC',
  CustomTextAsc = 'customText_ASC',
  CustomTextDesc = 'customText_DESC',
}

export type LicenseWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  code_isNull?: Maybe<Scalars['Boolean']>
  code_eq?: Maybe<Scalars['Int']>
  code_not_eq?: Maybe<Scalars['Int']>
  code_gt?: Maybe<Scalars['Int']>
  code_gte?: Maybe<Scalars['Int']>
  code_lt?: Maybe<Scalars['Int']>
  code_lte?: Maybe<Scalars['Int']>
  code_in?: Maybe<Array<Scalars['Int']>>
  code_not_in?: Maybe<Array<Scalars['Int']>>
  attribution_isNull?: Maybe<Scalars['Boolean']>
  attribution_eq?: Maybe<Scalars['String']>
  attribution_not_eq?: Maybe<Scalars['String']>
  attribution_gt?: Maybe<Scalars['String']>
  attribution_gte?: Maybe<Scalars['String']>
  attribution_lt?: Maybe<Scalars['String']>
  attribution_lte?: Maybe<Scalars['String']>
  attribution_in?: Maybe<Array<Scalars['String']>>
  attribution_not_in?: Maybe<Array<Scalars['String']>>
  attribution_contains?: Maybe<Scalars['String']>
  attribution_not_contains?: Maybe<Scalars['String']>
  attribution_containsInsensitive?: Maybe<Scalars['String']>
  attribution_not_containsInsensitive?: Maybe<Scalars['String']>
  attribution_startsWith?: Maybe<Scalars['String']>
  attribution_not_startsWith?: Maybe<Scalars['String']>
  attribution_endsWith?: Maybe<Scalars['String']>
  attribution_not_endsWith?: Maybe<Scalars['String']>
  customText_isNull?: Maybe<Scalars['Boolean']>
  customText_eq?: Maybe<Scalars['String']>
  customText_not_eq?: Maybe<Scalars['String']>
  customText_gt?: Maybe<Scalars['String']>
  customText_gte?: Maybe<Scalars['String']>
  customText_lt?: Maybe<Scalars['String']>
  customText_lte?: Maybe<Scalars['String']>
  customText_in?: Maybe<Array<Scalars['String']>>
  customText_not_in?: Maybe<Array<Scalars['String']>>
  customText_contains?: Maybe<Scalars['String']>
  customText_not_contains?: Maybe<Scalars['String']>
  customText_containsInsensitive?: Maybe<Scalars['String']>
  customText_not_containsInsensitive?: Maybe<Scalars['String']>
  customText_startsWith?: Maybe<Scalars['String']>
  customText_not_startsWith?: Maybe<Scalars['String']>
  customText_endsWith?: Maybe<Scalars['String']>
  customText_not_endsWith?: Maybe<Scalars['String']>
  AND?: Maybe<Array<LicenseWhereInput>>
  OR?: Maybe<Array<LicenseWhereInput>>
}

export type LicensesConnection = {
  edges: Array<LicenseEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type MarkNotificationsAsReadResult = {
  notificationsReadIds: Array<Scalars['String']>
}

export type MaxAttemptsOnMailDelivery = {
  maxAttempts: Scalars['Int']
}

export type MemberBannedFromChannelEventData = {
  /** The chanel the member is being banned / unbanned from */
  channel: Channel
  /** The member being banned / unbanned */
  member: Membership
  /** The action performed. TRUE if the member is being banned, FALSE if the member is being unbanned */
  action: Scalars['Boolean']
}

export type MemberMetadata = {
  id: Scalars['String']
  /** Member's name */
  name?: Maybe<Scalars['String']>
  /** Avatar data object */
  avatar?: Maybe<Avatar>
  /** Short text chosen by member to share information about themselves */
  about?: Maybe<Scalars['String']>
  member: Membership
}

export type MemberMetadataConnection = {
  edges: Array<MemberMetadataEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type MemberMetadataEdge = {
  node: MemberMetadata
  cursor: Scalars['String']
}

export enum MemberMetadataOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  NameAsc = 'name_ASC',
  NameDesc = 'name_DESC',
  AvatarAvatarUriAsc = 'avatar_avatarUri_ASC',
  AvatarAvatarUriDesc = 'avatar_avatarUri_DESC',
  AvatarIsTypeOfAsc = 'avatar_isTypeOf_ASC',
  AvatarIsTypeOfDesc = 'avatar_isTypeOf_DESC',
  AboutAsc = 'about_ASC',
  AboutDesc = 'about_DESC',
  MemberIdAsc = 'member_id_ASC',
  MemberIdDesc = 'member_id_DESC',
  MemberCreatedAtAsc = 'member_createdAt_ASC',
  MemberCreatedAtDesc = 'member_createdAt_DESC',
  MemberHandleAsc = 'member_handle_ASC',
  MemberHandleDesc = 'member_handle_DESC',
  MemberHandleRawAsc = 'member_handleRaw_ASC',
  MemberHandleRawDesc = 'member_handleRaw_DESC',
  MemberControllerAccountAsc = 'member_controllerAccount_ASC',
  MemberControllerAccountDesc = 'member_controllerAccount_DESC',
  MemberTotalChannelsCreatedAsc = 'member_totalChannelsCreated_ASC',
  MemberTotalChannelsCreatedDesc = 'member_totalChannelsCreated_DESC',
}

export type MemberMetadataWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  name_isNull?: Maybe<Scalars['Boolean']>
  name_eq?: Maybe<Scalars['String']>
  name_not_eq?: Maybe<Scalars['String']>
  name_gt?: Maybe<Scalars['String']>
  name_gte?: Maybe<Scalars['String']>
  name_lt?: Maybe<Scalars['String']>
  name_lte?: Maybe<Scalars['String']>
  name_in?: Maybe<Array<Scalars['String']>>
  name_not_in?: Maybe<Array<Scalars['String']>>
  name_contains?: Maybe<Scalars['String']>
  name_not_contains?: Maybe<Scalars['String']>
  name_containsInsensitive?: Maybe<Scalars['String']>
  name_not_containsInsensitive?: Maybe<Scalars['String']>
  name_startsWith?: Maybe<Scalars['String']>
  name_not_startsWith?: Maybe<Scalars['String']>
  name_endsWith?: Maybe<Scalars['String']>
  name_not_endsWith?: Maybe<Scalars['String']>
  avatar_isNull?: Maybe<Scalars['Boolean']>
  avatar?: Maybe<AvatarWhereInput>
  about_isNull?: Maybe<Scalars['Boolean']>
  about_eq?: Maybe<Scalars['String']>
  about_not_eq?: Maybe<Scalars['String']>
  about_gt?: Maybe<Scalars['String']>
  about_gte?: Maybe<Scalars['String']>
  about_lt?: Maybe<Scalars['String']>
  about_lte?: Maybe<Scalars['String']>
  about_in?: Maybe<Array<Scalars['String']>>
  about_not_in?: Maybe<Array<Scalars['String']>>
  about_contains?: Maybe<Scalars['String']>
  about_not_contains?: Maybe<Scalars['String']>
  about_containsInsensitive?: Maybe<Scalars['String']>
  about_not_containsInsensitive?: Maybe<Scalars['String']>
  about_startsWith?: Maybe<Scalars['String']>
  about_not_startsWith?: Maybe<Scalars['String']>
  about_endsWith?: Maybe<Scalars['String']>
  about_not_endsWith?: Maybe<Scalars['String']>
  member_isNull?: Maybe<Scalars['Boolean']>
  member?: Maybe<MembershipWhereInput>
  AND?: Maybe<Array<MemberMetadataWhereInput>>
  OR?: Maybe<Array<MemberMetadataWhereInput>>
}

export type MemberRecipient = {
  /** membership */
  membership: Membership
}

/** Stored information about a registered user */
export type Membership = {
  /** MemberId: runtime identifier for a user */
  id: Scalars['String']
  /** Timestamp of the block the membership was created at */
  createdAt: Scalars['DateTime']
  /** The handle coming from decoded handleRaw if possible */
  handle: Scalars['String']
  /** The handle chosen by member coming from event deposit */
  handleRaw: Scalars['String']
  /** Member's metadata */
  metadata?: Maybe<MemberMetadata>
  /** Member's controller account id */
  controllerAccount: Scalars['String']
  /** Auctions in which is this user whitelisted to participate */
  whitelistedInAuctions: Array<AuctionWhitelistedMember>
  /** Channels owned by this member */
  channels: Array<Channel>
  /** Channels the member is banned from (in terms of commenting/reacting) */
  bannedFromChannels: Array<BannedMember>
  /** Number of channels ever created by this member */
  totalChannelsCreated: Scalars['Int']
}

/** Stored information about a registered user */
export type MembershipWhitelistedInAuctionsArgs = {
  where?: Maybe<AuctionWhitelistedMemberWhereInput>
  orderBy?: Maybe<Array<AuctionWhitelistedMemberOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

/** Stored information about a registered user */
export type MembershipChannelsArgs = {
  where?: Maybe<ChannelWhereInput>
  orderBy?: Maybe<Array<ChannelOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

/** Stored information about a registered user */
export type MembershipBannedFromChannelsArgs = {
  where?: Maybe<BannedMemberWhereInput>
  orderBy?: Maybe<Array<BannedMemberOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type MembershipEdge = {
  node: Membership
  cursor: Scalars['String']
}

export enum MembershipOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  CreatedAtAsc = 'createdAt_ASC',
  CreatedAtDesc = 'createdAt_DESC',
  HandleAsc = 'handle_ASC',
  HandleDesc = 'handle_DESC',
  HandleRawAsc = 'handleRaw_ASC',
  HandleRawDesc = 'handleRaw_DESC',
  MetadataIdAsc = 'metadata_id_ASC',
  MetadataIdDesc = 'metadata_id_DESC',
  MetadataNameAsc = 'metadata_name_ASC',
  MetadataNameDesc = 'metadata_name_DESC',
  MetadataAboutAsc = 'metadata_about_ASC',
  MetadataAboutDesc = 'metadata_about_DESC',
  ControllerAccountAsc = 'controllerAccount_ASC',
  ControllerAccountDesc = 'controllerAccount_DESC',
  TotalChannelsCreatedAsc = 'totalChannelsCreated_ASC',
  TotalChannelsCreatedDesc = 'totalChannelsCreated_DESC',
}

export type MembershipWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  createdAt_isNull?: Maybe<Scalars['Boolean']>
  createdAt_eq?: Maybe<Scalars['DateTime']>
  createdAt_not_eq?: Maybe<Scalars['DateTime']>
  createdAt_gt?: Maybe<Scalars['DateTime']>
  createdAt_gte?: Maybe<Scalars['DateTime']>
  createdAt_lt?: Maybe<Scalars['DateTime']>
  createdAt_lte?: Maybe<Scalars['DateTime']>
  createdAt_in?: Maybe<Array<Scalars['DateTime']>>
  createdAt_not_in?: Maybe<Array<Scalars['DateTime']>>
  handle_isNull?: Maybe<Scalars['Boolean']>
  handle_eq?: Maybe<Scalars['String']>
  handle_not_eq?: Maybe<Scalars['String']>
  handle_gt?: Maybe<Scalars['String']>
  handle_gte?: Maybe<Scalars['String']>
  handle_lt?: Maybe<Scalars['String']>
  handle_lte?: Maybe<Scalars['String']>
  handle_in?: Maybe<Array<Scalars['String']>>
  handle_not_in?: Maybe<Array<Scalars['String']>>
  handle_contains?: Maybe<Scalars['String']>
  handle_not_contains?: Maybe<Scalars['String']>
  handle_containsInsensitive?: Maybe<Scalars['String']>
  handle_not_containsInsensitive?: Maybe<Scalars['String']>
  handle_startsWith?: Maybe<Scalars['String']>
  handle_not_startsWith?: Maybe<Scalars['String']>
  handle_endsWith?: Maybe<Scalars['String']>
  handle_not_endsWith?: Maybe<Scalars['String']>
  handleRaw_isNull?: Maybe<Scalars['Boolean']>
  handleRaw_eq?: Maybe<Scalars['String']>
  handleRaw_not_eq?: Maybe<Scalars['String']>
  handleRaw_gt?: Maybe<Scalars['String']>
  handleRaw_gte?: Maybe<Scalars['String']>
  handleRaw_lt?: Maybe<Scalars['String']>
  handleRaw_lte?: Maybe<Scalars['String']>
  handleRaw_in?: Maybe<Array<Scalars['String']>>
  handleRaw_not_in?: Maybe<Array<Scalars['String']>>
  handleRaw_contains?: Maybe<Scalars['String']>
  handleRaw_not_contains?: Maybe<Scalars['String']>
  handleRaw_containsInsensitive?: Maybe<Scalars['String']>
  handleRaw_not_containsInsensitive?: Maybe<Scalars['String']>
  handleRaw_startsWith?: Maybe<Scalars['String']>
  handleRaw_not_startsWith?: Maybe<Scalars['String']>
  handleRaw_endsWith?: Maybe<Scalars['String']>
  handleRaw_not_endsWith?: Maybe<Scalars['String']>
  metadata_isNull?: Maybe<Scalars['Boolean']>
  metadata?: Maybe<MemberMetadataWhereInput>
  controllerAccount_isNull?: Maybe<Scalars['Boolean']>
  controllerAccount_eq?: Maybe<Scalars['String']>
  controllerAccount_not_eq?: Maybe<Scalars['String']>
  controllerAccount_gt?: Maybe<Scalars['String']>
  controllerAccount_gte?: Maybe<Scalars['String']>
  controllerAccount_lt?: Maybe<Scalars['String']>
  controllerAccount_lte?: Maybe<Scalars['String']>
  controllerAccount_in?: Maybe<Array<Scalars['String']>>
  controllerAccount_not_in?: Maybe<Array<Scalars['String']>>
  controllerAccount_contains?: Maybe<Scalars['String']>
  controllerAccount_not_contains?: Maybe<Scalars['String']>
  controllerAccount_containsInsensitive?: Maybe<Scalars['String']>
  controllerAccount_not_containsInsensitive?: Maybe<Scalars['String']>
  controllerAccount_startsWith?: Maybe<Scalars['String']>
  controllerAccount_not_startsWith?: Maybe<Scalars['String']>
  controllerAccount_endsWith?: Maybe<Scalars['String']>
  controllerAccount_not_endsWith?: Maybe<Scalars['String']>
  whitelistedInAuctions_every?: Maybe<AuctionWhitelistedMemberWhereInput>
  whitelistedInAuctions_some?: Maybe<AuctionWhitelistedMemberWhereInput>
  whitelistedInAuctions_none?: Maybe<AuctionWhitelistedMemberWhereInput>
  channels_every?: Maybe<ChannelWhereInput>
  channels_some?: Maybe<ChannelWhereInput>
  channels_none?: Maybe<ChannelWhereInput>
  bannedFromChannels_every?: Maybe<BannedMemberWhereInput>
  bannedFromChannels_some?: Maybe<BannedMemberWhereInput>
  bannedFromChannels_none?: Maybe<BannedMemberWhereInput>
  totalChannelsCreated_isNull?: Maybe<Scalars['Boolean']>
  totalChannelsCreated_eq?: Maybe<Scalars['Int']>
  totalChannelsCreated_not_eq?: Maybe<Scalars['Int']>
  totalChannelsCreated_gt?: Maybe<Scalars['Int']>
  totalChannelsCreated_gte?: Maybe<Scalars['Int']>
  totalChannelsCreated_lt?: Maybe<Scalars['Int']>
  totalChannelsCreated_lte?: Maybe<Scalars['Int']>
  totalChannelsCreated_in?: Maybe<Array<Scalars['Int']>>
  totalChannelsCreated_not_in?: Maybe<Array<Scalars['Int']>>
  AND?: Maybe<Array<MembershipWhereInput>>
  OR?: Maybe<Array<MembershipWhereInput>>
}

export type MembershipsConnection = {
  edges: Array<MembershipEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type MetaprotocolTransactionResult =
  | MetaprotocolTransactionResultOk
  | MetaprotocolTransactionResultCommentCreated
  | MetaprotocolTransactionResultCommentEdited
  | MetaprotocolTransactionResultCommentDeleted
  | MetaprotocolTransactionResultCommentModerated
  | MetaprotocolTransactionResultFailed
  | MetaprotocolTransactionResultChannelPaid

export type MetaprotocolTransactionResultChannelPaid = {
  channelPaid?: Maybe<Channel>
}

export type MetaprotocolTransactionResultCommentCreated = {
  commentCreated?: Maybe<Comment>
}

export type MetaprotocolTransactionResultCommentDeleted = {
  commentDeleted?: Maybe<Comment>
}

export type MetaprotocolTransactionResultCommentEdited = {
  commentEdited?: Maybe<Comment>
}

export type MetaprotocolTransactionResultCommentModerated = {
  commentModerated?: Maybe<Comment>
}

export type MetaprotocolTransactionResultFailed = {
  errorMessage: Scalars['String']
}

export type MetaprotocolTransactionResultOk = {
  phantom?: Maybe<Scalars['Int']>
}

export type MetaprotocolTransactionResultWhereInput = {
  phantom_isNull?: Maybe<Scalars['Boolean']>
  phantom_eq?: Maybe<Scalars['Int']>
  phantom_not_eq?: Maybe<Scalars['Int']>
  phantom_gt?: Maybe<Scalars['Int']>
  phantom_gte?: Maybe<Scalars['Int']>
  phantom_lt?: Maybe<Scalars['Int']>
  phantom_lte?: Maybe<Scalars['Int']>
  phantom_in?: Maybe<Array<Scalars['Int']>>
  phantom_not_in?: Maybe<Array<Scalars['Int']>>
  commentCreated_isNull?: Maybe<Scalars['Boolean']>
  commentCreated?: Maybe<CommentWhereInput>
  commentEdited_isNull?: Maybe<Scalars['Boolean']>
  commentEdited?: Maybe<CommentWhereInput>
  commentDeleted_isNull?: Maybe<Scalars['Boolean']>
  commentDeleted?: Maybe<CommentWhereInput>
  commentModerated_isNull?: Maybe<Scalars['Boolean']>
  commentModerated?: Maybe<CommentWhereInput>
  errorMessage_isNull?: Maybe<Scalars['Boolean']>
  errorMessage_eq?: Maybe<Scalars['String']>
  errorMessage_not_eq?: Maybe<Scalars['String']>
  errorMessage_gt?: Maybe<Scalars['String']>
  errorMessage_gte?: Maybe<Scalars['String']>
  errorMessage_lt?: Maybe<Scalars['String']>
  errorMessage_lte?: Maybe<Scalars['String']>
  errorMessage_in?: Maybe<Array<Scalars['String']>>
  errorMessage_not_in?: Maybe<Array<Scalars['String']>>
  errorMessage_contains?: Maybe<Scalars['String']>
  errorMessage_not_contains?: Maybe<Scalars['String']>
  errorMessage_containsInsensitive?: Maybe<Scalars['String']>
  errorMessage_not_containsInsensitive?: Maybe<Scalars['String']>
  errorMessage_startsWith?: Maybe<Scalars['String']>
  errorMessage_not_startsWith?: Maybe<Scalars['String']>
  errorMessage_endsWith?: Maybe<Scalars['String']>
  errorMessage_not_endsWith?: Maybe<Scalars['String']>
  channelPaid_isNull?: Maybe<Scalars['Boolean']>
  channelPaid?: Maybe<ChannelWhereInput>
  isTypeOf_isNull?: Maybe<Scalars['Boolean']>
  isTypeOf_eq?: Maybe<Scalars['String']>
  isTypeOf_not_eq?: Maybe<Scalars['String']>
  isTypeOf_gt?: Maybe<Scalars['String']>
  isTypeOf_gte?: Maybe<Scalars['String']>
  isTypeOf_lt?: Maybe<Scalars['String']>
  isTypeOf_lte?: Maybe<Scalars['String']>
  isTypeOf_in?: Maybe<Array<Scalars['String']>>
  isTypeOf_not_in?: Maybe<Array<Scalars['String']>>
  isTypeOf_contains?: Maybe<Scalars['String']>
  isTypeOf_not_contains?: Maybe<Scalars['String']>
  isTypeOf_containsInsensitive?: Maybe<Scalars['String']>
  isTypeOf_not_containsInsensitive?: Maybe<Scalars['String']>
  isTypeOf_startsWith?: Maybe<Scalars['String']>
  isTypeOf_not_startsWith?: Maybe<Scalars['String']>
  isTypeOf_endsWith?: Maybe<Scalars['String']>
  isTypeOf_not_endsWith?: Maybe<Scalars['String']>
}

export type MetaprotocolTransactionStatusEventData = {
  /** The result of metaprotocol action */
  result: MetaprotocolTransactionResult
}

export type Mutation = {
  setAppAssetStorage: SetNewAppAssetStorageResult
  setAppNameAlt: SetNewAppNameAltResult
  setNewNotificationAssetRoot: SetNewNotificationAssetRootResult
  grantPermissions: GrantOrRevokeOperatorPermissionsResult
  revokePermission: GrantOrRevokeOperatorPermissionsResult
  setVideoWeights: VideoWeights
  setMaxAttemptsOnMailDelivery: Scalars['Int']
  setNewNotificationCenterPath: Scalars['Int']
  setNewAppRootDomain: AppRootDomain
  setChannelsWeights: Array<ChannelWeight>
  setKillSwitch: KillSwitch
  setVideoViewPerUserTimeLimit: VideoViewPerUserTimeLimit
  setVideoHero: SetVideoHeroResult
  setCategoryFeaturedVideos: SetCategoryFeaturedVideosResult
  setSupportedCategories: SetSupportedCategoriesResult
  setFeaturedNfts: SetFeaturedNftsResult
  excludeContent: ExcludeContentResult
  restoreContent: RestoreContentResult
  signAppActionCommitment: GeneratedSignature
  followChannel: ChannelFollowResult
  unfollowChannel: ChannelUnfollowResult
  reportChannel: ChannelReportInfo
  suspendChannels: Array<SuspendChannelResult>
  verifyChannel: VerifyChannelResult
  excludeChannel: ExcludeChannelResult
  setOrUnsetPublicFeedVideos: SetOrUnsetPublicFeedResult
  addVideoView: AddVideoViewResult
  reportVideo: VideoReportInfo
  excludeVideo: ExcludeVideoInfo
  requestNftFeatured: NftFeaturedRequstInfo
  markNotificationsAsRead: MarkNotificationsAsReadResult
  setAccountNotificationPreferences: AccountNotificationPreferencesOutput
}

export type MutationSetAppAssetStorageArgs = {
  newAppAssetStorage: Scalars['String']
}

export type MutationSetAppNameAltArgs = {
  newAppNameAlt: Scalars['String']
}

export type MutationSetNewNotificationAssetRootArgs = {
  newNotificationAssetRoot: Scalars['String']
}

export type MutationGrantPermissionsArgs = {
  userId?: Maybe<Scalars['String']>
  permissions?: Maybe<Array<OperatorPermission>>
}

export type MutationRevokePermissionArgs = {
  userId?: Maybe<Scalars['String']>
  permissions?: Maybe<Array<OperatorPermission>>
}

export type MutationSetVideoWeightsArgs = {
  newnessWeight: Scalars['Float']
  viewsWeight: Scalars['Float']
  commentsWeight: Scalars['Float']
  reactionsWeight: Scalars['Float']
  joysteamTimestampSubWeight: Scalars['Float']
  ytTimestampSubWeight: Scalars['Float']
  defaultChannelWeight: Scalars['Float']
}

export type MutationSetMaxAttemptsOnMailDeliveryArgs = {
  newMaxAttempts: Scalars['Int']
}

export type MutationSetNewNotificationCenterPathArgs = {
  newMaxAttempts: Scalars['Int']
}

export type MutationSetNewAppRootDomainArgs = {
  newRootDomain: Scalars['String']
}

export type MutationSetChannelsWeightsArgs = {
  inputs: Array<ChannelWeightInput>
}

export type MutationSetKillSwitchArgs = {
  isKilled: Scalars['Boolean']
}

export type MutationSetVideoViewPerUserTimeLimitArgs = {
  limitInSeconds: Scalars['Int']
}

export type MutationSetVideoHeroArgs = {
  videoId: Scalars['String']
  heroTitle: Scalars['String']
  videoCutUrl: Scalars['String']
  heroPosterUrl: Scalars['String']
}

export type MutationSetCategoryFeaturedVideosArgs = {
  categoryId: Scalars['String']
  videos: Array<FeaturedVideoInput>
}

export type MutationSetSupportedCategoriesArgs = {
  supportedCategoriesIds?: Maybe<Array<Scalars['String']>>
  supportNewCategories?: Maybe<Scalars['Boolean']>
  supportNoCategoryVideos?: Maybe<Scalars['Boolean']>
}

export type MutationSetFeaturedNftsArgs = {
  featuredNftsIds: Array<Scalars['String']>
}

export type MutationExcludeContentArgs = {
  type: ExcludableContentType
  ids: Array<Scalars['String']>
}

export type MutationRestoreContentArgs = {
  type: ExcludableContentType
  ids: Array<Scalars['String']>
}

export type MutationSignAppActionCommitmentArgs = {
  nonce: Scalars['Float']
  creatorId: Scalars['String']
  assets: Scalars['String']
  rawAction: Scalars['String']
  actionType: AppActionActionType
}

export type MutationFollowChannelArgs = {
  channelId: Scalars['String']
}

export type MutationUnfollowChannelArgs = {
  channelId: Scalars['String']
}

export type MutationReportChannelArgs = {
  channelId: Scalars['String']
  rationale: Scalars['String']
}

export type MutationSuspendChannelsArgs = {
  channelIds: Array<Scalars['String']>
}

export type MutationVerifyChannelArgs = {
  channelIds: Array<Scalars['String']>
}

export type MutationExcludeChannelArgs = {
  channelId: Scalars['String']
  rationale: Scalars['String']
}

export type MutationSetOrUnsetPublicFeedVideosArgs = {
  videoIds: Array<Scalars['String']>
  operation: PublicFeedOperationType
}

export type MutationAddVideoViewArgs = {
  videoId: Scalars['String']
}

export type MutationReportVideoArgs = {
  videoId: Scalars['String']
  rationale: Scalars['String']
}

export type MutationExcludeVideoArgs = {
  videoId: Scalars['String']
  rationale: Scalars['String']
}

export type MutationRequestNftFeaturedArgs = {
  nftId: Scalars['String']
  rationale: Scalars['String']
}

export type MutationMarkNotificationsAsReadArgs = {
  notificationIds: Array<Scalars['String']>
}

export type MutationSetAccountNotificationPreferencesArgs = {
  notificationPreferences: AccountNotificationPreferencesInput
}

export type NewAuction = {
  /** channel title for notification text */
  channelTitle: Scalars['String']
  /** channel id for notification link */
  channelId: Scalars['String']
  /** video title for notification text */
  videoTitle: Scalars['String']
  /** video Id used for link */
  videoId: Scalars['String']
}

export type NewChannelFollower = {
  /** follower member id for the avatar and the link */
  followerId: Scalars['String']
  /** follower member handle for the text */
  followerHandle: Scalars['String']
}

export type NewNftOnSale = {
  /** channel title for notification text */
  channelTitle: Scalars['String']
  /** video title for notification text */
  videoTitle: Scalars['String']
  /** video Id used for link */
  videoId: Scalars['String']
  /** channel id for notification link */
  channelId: Scalars['String']
}

export type NftActivitiesConnection = {
  edges: Array<NftActivityEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type NftActivity = {
  /** Autoincremented */
  id: Scalars['String']
  /** The member the activity relates to */
  member: Membership
  /** Nft-related activity */
  event: Event
}

export type NftActivityEdge = {
  node: NftActivity
  cursor: Scalars['String']
}

export enum NftActivityOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  MemberIdAsc = 'member_id_ASC',
  MemberIdDesc = 'member_id_DESC',
  MemberCreatedAtAsc = 'member_createdAt_ASC',
  MemberCreatedAtDesc = 'member_createdAt_DESC',
  MemberHandleAsc = 'member_handle_ASC',
  MemberHandleDesc = 'member_handle_DESC',
  MemberHandleRawAsc = 'member_handleRaw_ASC',
  MemberHandleRawDesc = 'member_handleRaw_DESC',
  MemberControllerAccountAsc = 'member_controllerAccount_ASC',
  MemberControllerAccountDesc = 'member_controllerAccount_DESC',
  MemberTotalChannelsCreatedAsc = 'member_totalChannelsCreated_ASC',
  MemberTotalChannelsCreatedDesc = 'member_totalChannelsCreated_DESC',
  EventIdAsc = 'event_id_ASC',
  EventIdDesc = 'event_id_DESC',
  EventInBlockAsc = 'event_inBlock_ASC',
  EventInBlockDesc = 'event_inBlock_DESC',
  EventInExtrinsicAsc = 'event_inExtrinsic_ASC',
  EventInExtrinsicDesc = 'event_inExtrinsic_DESC',
  EventIndexInBlockAsc = 'event_indexInBlock_ASC',
  EventIndexInBlockDesc = 'event_indexInBlock_DESC',
  EventTimestampAsc = 'event_timestamp_ASC',
  EventTimestampDesc = 'event_timestamp_DESC',
}

export type NftActivityWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  member_isNull?: Maybe<Scalars['Boolean']>
  member?: Maybe<MembershipWhereInput>
  event_isNull?: Maybe<Scalars['Boolean']>
  event?: Maybe<EventWhereInput>
  AND?: Maybe<Array<NftActivityWhereInput>>
  OR?: Maybe<Array<NftActivityWhereInput>>
}

export type NftBoughtEventData = {
  /** The NFT that was bought */
  nft: OwnedNft
  /** Member that bought the NFT. */
  buyer: Membership
  /** NFT owner before it was bought */
  previousNftOwner: NftOwner
  /** Price for which the NFT was bought */
  price: Scalars['BigInt']
}

export type NftFeaturedOnMarketPlace = {
  /** videoId used for link construction */
  videoId: Scalars['String']
  /** video title for notification text */
  videoTitle: Scalars['String']
}

export type NftFeaturedRequstInfo = {
  nftId: Scalars['String']
  id: Scalars['String']
  rationale: Scalars['String']
  createdAt: Scalars['DateTime']
  created: Scalars['Boolean']
}

export type NftFeaturingRequest = {
  /** Unique identifier of the request */
  id: Scalars['String']
  /** User that requested the nft to be featured */
  user: User
  /** ID of the nft that is being requested to be featured by operator */
  nftId: Scalars['String']
  /** Time of the request */
  timestamp: Scalars['DateTime']
  /** Rationale behind the request */
  rationale: Scalars['String']
}

export type NftFeaturingRequestEdge = {
  node: NftFeaturingRequest
  cursor: Scalars['String']
}

export enum NftFeaturingRequestOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  UserIdAsc = 'user_id_ASC',
  UserIdDesc = 'user_id_DESC',
  UserIsRootAsc = 'user_isRoot_ASC',
  UserIsRootDesc = 'user_isRoot_DESC',
  NftIdAsc = 'nftId_ASC',
  NftIdDesc = 'nftId_DESC',
  TimestampAsc = 'timestamp_ASC',
  TimestampDesc = 'timestamp_DESC',
  RationaleAsc = 'rationale_ASC',
  RationaleDesc = 'rationale_DESC',
}

export type NftFeaturingRequestWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  user_isNull?: Maybe<Scalars['Boolean']>
  user?: Maybe<UserWhereInput>
  nftId_isNull?: Maybe<Scalars['Boolean']>
  nftId_eq?: Maybe<Scalars['String']>
  nftId_not_eq?: Maybe<Scalars['String']>
  nftId_gt?: Maybe<Scalars['String']>
  nftId_gte?: Maybe<Scalars['String']>
  nftId_lt?: Maybe<Scalars['String']>
  nftId_lte?: Maybe<Scalars['String']>
  nftId_in?: Maybe<Array<Scalars['String']>>
  nftId_not_in?: Maybe<Array<Scalars['String']>>
  nftId_contains?: Maybe<Scalars['String']>
  nftId_not_contains?: Maybe<Scalars['String']>
  nftId_containsInsensitive?: Maybe<Scalars['String']>
  nftId_not_containsInsensitive?: Maybe<Scalars['String']>
  nftId_startsWith?: Maybe<Scalars['String']>
  nftId_not_startsWith?: Maybe<Scalars['String']>
  nftId_endsWith?: Maybe<Scalars['String']>
  nftId_not_endsWith?: Maybe<Scalars['String']>
  timestamp_isNull?: Maybe<Scalars['Boolean']>
  timestamp_eq?: Maybe<Scalars['DateTime']>
  timestamp_not_eq?: Maybe<Scalars['DateTime']>
  timestamp_gt?: Maybe<Scalars['DateTime']>
  timestamp_gte?: Maybe<Scalars['DateTime']>
  timestamp_lt?: Maybe<Scalars['DateTime']>
  timestamp_lte?: Maybe<Scalars['DateTime']>
  timestamp_in?: Maybe<Array<Scalars['DateTime']>>
  timestamp_not_in?: Maybe<Array<Scalars['DateTime']>>
  rationale_isNull?: Maybe<Scalars['Boolean']>
  rationale_eq?: Maybe<Scalars['String']>
  rationale_not_eq?: Maybe<Scalars['String']>
  rationale_gt?: Maybe<Scalars['String']>
  rationale_gte?: Maybe<Scalars['String']>
  rationale_lt?: Maybe<Scalars['String']>
  rationale_lte?: Maybe<Scalars['String']>
  rationale_in?: Maybe<Array<Scalars['String']>>
  rationale_not_in?: Maybe<Array<Scalars['String']>>
  rationale_contains?: Maybe<Scalars['String']>
  rationale_not_contains?: Maybe<Scalars['String']>
  rationale_containsInsensitive?: Maybe<Scalars['String']>
  rationale_not_containsInsensitive?: Maybe<Scalars['String']>
  rationale_startsWith?: Maybe<Scalars['String']>
  rationale_not_startsWith?: Maybe<Scalars['String']>
  rationale_endsWith?: Maybe<Scalars['String']>
  rationale_not_endsWith?: Maybe<Scalars['String']>
  AND?: Maybe<Array<NftFeaturingRequestWhereInput>>
  OR?: Maybe<Array<NftFeaturingRequestWhereInput>>
}

export type NftFeaturingRequestsConnection = {
  edges: Array<NftFeaturingRequestEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type NftHistoryEntriesConnection = {
  edges: Array<NftHistoryEntryEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type NftHistoryEntry = {
  /** Autoincremented */
  id: Scalars['String']
  /** The NFT the event relates to */
  nft: OwnedNft
  /** Nft-related event */
  event: Event
}

export type NftHistoryEntryEdge = {
  node: NftHistoryEntry
  cursor: Scalars['String']
}

export enum NftHistoryEntryOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  NftIdAsc = 'nft_id_ASC',
  NftIdDesc = 'nft_id_DESC',
  NftCreatedAtAsc = 'nft_createdAt_ASC',
  NftCreatedAtDesc = 'nft_createdAt_DESC',
  NftCreatorRoyaltyAsc = 'nft_creatorRoyalty_ASC',
  NftCreatorRoyaltyDesc = 'nft_creatorRoyalty_DESC',
  NftLastSalePriceAsc = 'nft_lastSalePrice_ASC',
  NftLastSalePriceDesc = 'nft_lastSalePrice_DESC',
  NftLastSaleDateAsc = 'nft_lastSaleDate_ASC',
  NftLastSaleDateDesc = 'nft_lastSaleDate_DESC',
  NftIsFeaturedAsc = 'nft_isFeatured_ASC',
  NftIsFeaturedDesc = 'nft_isFeatured_DESC',
  EventIdAsc = 'event_id_ASC',
  EventIdDesc = 'event_id_DESC',
  EventInBlockAsc = 'event_inBlock_ASC',
  EventInBlockDesc = 'event_inBlock_DESC',
  EventInExtrinsicAsc = 'event_inExtrinsic_ASC',
  EventInExtrinsicDesc = 'event_inExtrinsic_DESC',
  EventIndexInBlockAsc = 'event_indexInBlock_ASC',
  EventIndexInBlockDesc = 'event_indexInBlock_DESC',
  EventTimestampAsc = 'event_timestamp_ASC',
  EventTimestampDesc = 'event_timestamp_DESC',
}

export type NftHistoryEntryWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  nft_isNull?: Maybe<Scalars['Boolean']>
  nft?: Maybe<OwnedNftWhereInput>
  event_isNull?: Maybe<Scalars['Boolean']>
  event?: Maybe<EventWhereInput>
  AND?: Maybe<Array<NftHistoryEntryWhereInput>>
  OR?: Maybe<Array<NftHistoryEntryWhereInput>>
}

export type NftIssuedEventData = {
  /** Actor that issued the NFT. */
  actor: ContentActor
  /** NFT that was issued. */
  nft: OwnedNft
  /** NFT's initial owner. */
  nftOwner: NftOwner
}

export type NftOfferedEventData = {
  /** Nft owner at the time the nft was offered */
  nftOwner: NftOwner
}

export type NftOwner = NftOwnerChannel | NftOwnerMember

export type NftOwnerChannel = {
  channel: Channel
}

export type NftOwnerMember = {
  member: Membership
}

export type NftOwnerWhereInput = {
  channel_isNull?: Maybe<Scalars['Boolean']>
  channel?: Maybe<ChannelWhereInput>
  member_isNull?: Maybe<Scalars['Boolean']>
  member?: Maybe<MembershipWhereInput>
  isTypeOf_isNull?: Maybe<Scalars['Boolean']>
  isTypeOf_eq?: Maybe<Scalars['String']>
  isTypeOf_not_eq?: Maybe<Scalars['String']>
  isTypeOf_gt?: Maybe<Scalars['String']>
  isTypeOf_gte?: Maybe<Scalars['String']>
  isTypeOf_lt?: Maybe<Scalars['String']>
  isTypeOf_lte?: Maybe<Scalars['String']>
  isTypeOf_in?: Maybe<Array<Scalars['String']>>
  isTypeOf_not_in?: Maybe<Array<Scalars['String']>>
  isTypeOf_contains?: Maybe<Scalars['String']>
  isTypeOf_not_contains?: Maybe<Scalars['String']>
  isTypeOf_containsInsensitive?: Maybe<Scalars['String']>
  isTypeOf_not_containsInsensitive?: Maybe<Scalars['String']>
  isTypeOf_startsWith?: Maybe<Scalars['String']>
  isTypeOf_not_startsWith?: Maybe<Scalars['String']>
  isTypeOf_endsWith?: Maybe<Scalars['String']>
  isTypeOf_not_endsWith?: Maybe<Scalars['String']>
}

export type NftPurchased = {
  /** video Id used for link */
  videoId: Scalars['String']
  /** video title for notification text */
  videoTitle: Scalars['String']
  /** buyer id for notification the avatar */
  buyerId: Scalars['String']
  /** buyer handle for notification text */
  buyerHandle: Scalars['String']
  /** price paid */
  price: Scalars['BigInt']
}

export type NftRoyaltyPaid = {
  /** video title for notification text */
  videoTitle: Scalars['String']
  /** video Id used for link */
  videoId: Scalars['String']
  /** bid amount */
  amount: Scalars['BigInt']
}

export type NftSellOrderMadeEventData = {
  /** NFT being sold */
  nft: OwnedNft
  /** Content actor acting as NFT owner. */
  actor: ContentActor
  /** NFT owner at the time it was put on sale */
  nftOwner: NftOwner
  /** Offer's price. */
  price: Scalars['BigInt']
}

export type NodeLocationMetadata = {
  /** ISO 3166-1 alpha-2 country code (2 letters) */
  countryCode?: Maybe<Scalars['String']>
  /** City name */
  city?: Maybe<Scalars['String']>
  /** Geographic coordinates */
  coordinates?: Maybe<GeoCoordinates>
}

export type NodeLocationMetadataWhereInput = {
  countryCode_isNull?: Maybe<Scalars['Boolean']>
  countryCode_eq?: Maybe<Scalars['String']>
  countryCode_not_eq?: Maybe<Scalars['String']>
  countryCode_gt?: Maybe<Scalars['String']>
  countryCode_gte?: Maybe<Scalars['String']>
  countryCode_lt?: Maybe<Scalars['String']>
  countryCode_lte?: Maybe<Scalars['String']>
  countryCode_in?: Maybe<Array<Scalars['String']>>
  countryCode_not_in?: Maybe<Array<Scalars['String']>>
  countryCode_contains?: Maybe<Scalars['String']>
  countryCode_not_contains?: Maybe<Scalars['String']>
  countryCode_containsInsensitive?: Maybe<Scalars['String']>
  countryCode_not_containsInsensitive?: Maybe<Scalars['String']>
  countryCode_startsWith?: Maybe<Scalars['String']>
  countryCode_not_startsWith?: Maybe<Scalars['String']>
  countryCode_endsWith?: Maybe<Scalars['String']>
  countryCode_not_endsWith?: Maybe<Scalars['String']>
  city_isNull?: Maybe<Scalars['Boolean']>
  city_eq?: Maybe<Scalars['String']>
  city_not_eq?: Maybe<Scalars['String']>
  city_gt?: Maybe<Scalars['String']>
  city_gte?: Maybe<Scalars['String']>
  city_lt?: Maybe<Scalars['String']>
  city_lte?: Maybe<Scalars['String']>
  city_in?: Maybe<Array<Scalars['String']>>
  city_not_in?: Maybe<Array<Scalars['String']>>
  city_contains?: Maybe<Scalars['String']>
  city_not_contains?: Maybe<Scalars['String']>
  city_containsInsensitive?: Maybe<Scalars['String']>
  city_not_containsInsensitive?: Maybe<Scalars['String']>
  city_startsWith?: Maybe<Scalars['String']>
  city_not_startsWith?: Maybe<Scalars['String']>
  city_endsWith?: Maybe<Scalars['String']>
  city_not_endsWith?: Maybe<Scalars['String']>
  coordinates_isNull?: Maybe<Scalars['Boolean']>
  coordinates?: Maybe<GeoCoordinatesWhereInput>
}

export type Notification = {
  id: Scalars['String']
  /** Member that should recieve the notification */
  account: Account
  /** type of the notification, used for */
  notificationType: NotificationType
  /** related event for on chain notifications */
  event?: Maybe<Event>
  /** status */
  status: ReadOrUnread
  /** wether this notification should be displayed in app */
  inApp: Scalars['Boolean']
  /** timestamp */
  createdAt: Scalars['DateTime']
  /** recipient */
  recipient: RecipientType
}

export type NotificationEdge = {
  node: Notification
  cursor: Scalars['String']
}

export type NotificationEmailDeliveriesConnection = {
  edges: Array<NotificationEmailDeliveryEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type NotificationEmailDelivery = {
  /** UUID */
  id: Scalars['String']
  /** the notification being delivered */
  notification: Notification
  /** notification delivery status */
  attempts: Array<EmailDeliveryAttempt>
  /** mark as discard after max attempts or successful attempt */
  discard: Scalars['Boolean']
}

export type NotificationEmailDeliveryAttemptsArgs = {
  where?: Maybe<EmailDeliveryAttemptWhereInput>
  orderBy?: Maybe<Array<EmailDeliveryAttemptOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type NotificationEmailDeliveryEdge = {
  node: NotificationEmailDelivery
  cursor: Scalars['String']
}

export enum NotificationEmailDeliveryOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  NotificationIdAsc = 'notification_id_ASC',
  NotificationIdDesc = 'notification_id_DESC',
  NotificationInAppAsc = 'notification_inApp_ASC',
  NotificationInAppDesc = 'notification_inApp_DESC',
  NotificationCreatedAtAsc = 'notification_createdAt_ASC',
  NotificationCreatedAtDesc = 'notification_createdAt_DESC',
  DiscardAsc = 'discard_ASC',
  DiscardDesc = 'discard_DESC',
}

export type NotificationEmailDeliveryWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  notification_isNull?: Maybe<Scalars['Boolean']>
  notification?: Maybe<NotificationWhereInput>
  attempts_every?: Maybe<EmailDeliveryAttemptWhereInput>
  attempts_some?: Maybe<EmailDeliveryAttemptWhereInput>
  attempts_none?: Maybe<EmailDeliveryAttemptWhereInput>
  discard_isNull?: Maybe<Scalars['Boolean']>
  discard_eq?: Maybe<Scalars['Boolean']>
  discard_not_eq?: Maybe<Scalars['Boolean']>
  AND?: Maybe<Array<NotificationEmailDeliveryWhereInput>>
  OR?: Maybe<Array<NotificationEmailDeliveryWhereInput>>
}

export enum NotificationOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  AccountIdAsc = 'account_id_ASC',
  AccountIdDesc = 'account_id_DESC',
  AccountEmailAsc = 'account_email_ASC',
  AccountEmailDesc = 'account_email_DESC',
  AccountIsEmailConfirmedAsc = 'account_isEmailConfirmed_ASC',
  AccountIsEmailConfirmedDesc = 'account_isEmailConfirmed_DESC',
  AccountIsBlockedAsc = 'account_isBlocked_ASC',
  AccountIsBlockedDesc = 'account_isBlocked_DESC',
  AccountRegisteredAtAsc = 'account_registeredAt_ASC',
  AccountRegisteredAtDesc = 'account_registeredAt_DESC',
  AccountJoystreamAccountAsc = 'account_joystreamAccount_ASC',
  AccountJoystreamAccountDesc = 'account_joystreamAccount_DESC',
  AccountReferrerChannelIdAsc = 'account_referrerChannelId_ASC',
  AccountReferrerChannelIdDesc = 'account_referrerChannelId_DESC',
  NotificationTypeChannelTitleAsc = 'notificationType_channelTitle_ASC',
  NotificationTypeChannelTitleDesc = 'notificationType_channelTitle_DESC',
  NotificationTypeVideoTitleAsc = 'notificationType_videoTitle_ASC',
  NotificationTypeVideoTitleDesc = 'notificationType_videoTitle_DESC',
  NotificationTypeVideoIdAsc = 'notificationType_videoId_ASC',
  NotificationTypeVideoIdDesc = 'notificationType_videoId_DESC',
  NotificationTypeFollowerIdAsc = 'notificationType_followerId_ASC',
  NotificationTypeFollowerIdDesc = 'notificationType_followerId_DESC',
  NotificationTypeFollowerHandleAsc = 'notificationType_followerHandle_ASC',
  NotificationTypeFollowerHandleDesc = 'notificationType_followerHandle_DESC',
  NotificationTypeMemberIdAsc = 'notificationType_memberId_ASC',
  NotificationTypeMemberIdDesc = 'notificationType_memberId_DESC',
  NotificationTypeMemberHandleAsc = 'notificationType_memberHandle_ASC',
  NotificationTypeMemberHandleDesc = 'notificationType_memberHandle_DESC',
  NotificationTypeComentIdAsc = 'notificationType_comentId_ASC',
  NotificationTypeComentIdDesc = 'notificationType_comentId_DESC',
  NotificationTypePhantomAsc = 'notificationType_phantom_ASC',
  NotificationTypePhantomDesc = 'notificationType_phantom_DESC',
  NotificationTypeBuyerIdAsc = 'notificationType_buyerId_ASC',
  NotificationTypeBuyerIdDesc = 'notificationType_buyerId_DESC',
  NotificationTypeBuyerHandleAsc = 'notificationType_buyerHandle_ASC',
  NotificationTypeBuyerHandleDesc = 'notificationType_buyerHandle_DESC',
  NotificationTypePriceAsc = 'notificationType_price_ASC',
  NotificationTypePriceDesc = 'notificationType_price_DESC',
  NotificationTypeBidderIdAsc = 'notificationType_bidderId_ASC',
  NotificationTypeBidderIdDesc = 'notificationType_bidderId_DESC',
  NotificationTypeBidderHandleAsc = 'notificationType_bidderHandle_ASC',
  NotificationTypeBidderHandleDesc = 'notificationType_bidderHandle_DESC',
  NotificationTypeAmountAsc = 'notificationType_amount_ASC',
  NotificationTypeAmountDesc = 'notificationType_amount_DESC',
  NotificationTypePayerIdAsc = 'notificationType_payerId_ASC',
  NotificationTypePayerIdDesc = 'notificationType_payerId_DESC',
  NotificationTypePayerHandleAsc = 'notificationType_payerHandle_ASC',
  NotificationTypePayerHandleDesc = 'notificationType_payerHandle_DESC',
  NotificationTypeChannelIdAsc = 'notificationType_channelId_ASC',
  NotificationTypeChannelIdDesc = 'notificationType_channelId_DESC',
  NotificationTypeCommentIdAsc = 'notificationType_commentId_ASC',
  NotificationTypeCommentIdDesc = 'notificationType_commentId_DESC',
  NotificationTypeNewBidderIdAsc = 'notificationType_newBidderId_ASC',
  NotificationTypeNewBidderIdDesc = 'notificationType_newBidderId_DESC',
  NotificationTypeNewBidderHandleAsc = 'notificationType_newBidderHandle_ASC',
  NotificationTypeNewBidderHandleDesc = 'notificationType_newBidderHandle_DESC',
  NotificationTypeIsTypeOfAsc = 'notificationType_isTypeOf_ASC',
  NotificationTypeIsTypeOfDesc = 'notificationType_isTypeOf_DESC',
  EventIdAsc = 'event_id_ASC',
  EventIdDesc = 'event_id_DESC',
  EventInBlockAsc = 'event_inBlock_ASC',
  EventInBlockDesc = 'event_inBlock_DESC',
  EventInExtrinsicAsc = 'event_inExtrinsic_ASC',
  EventInExtrinsicDesc = 'event_inExtrinsic_DESC',
  EventIndexInBlockAsc = 'event_indexInBlock_ASC',
  EventIndexInBlockDesc = 'event_indexInBlock_DESC',
  EventTimestampAsc = 'event_timestamp_ASC',
  EventTimestampDesc = 'event_timestamp_DESC',
  StatusReadAtAsc = 'status_readAt_ASC',
  StatusReadAtDesc = 'status_readAt_DESC',
  StatusPhantomAsc = 'status_phantom_ASC',
  StatusPhantomDesc = 'status_phantom_DESC',
  StatusIsTypeOfAsc = 'status_isTypeOf_ASC',
  StatusIsTypeOfDesc = 'status_isTypeOf_DESC',
  InAppAsc = 'inApp_ASC',
  InAppDesc = 'inApp_DESC',
  CreatedAtAsc = 'createdAt_ASC',
  CreatedAtDesc = 'createdAt_DESC',
  RecipientIsTypeOfAsc = 'recipient_isTypeOf_ASC',
  RecipientIsTypeOfDesc = 'recipient_isTypeOf_DESC',
}

export type NotificationPreference = {
  /** Notification is enabled in the app */
  inAppEnabled: Scalars['Boolean']
  /** Allows to send email for the notification */
  emailEnabled: Scalars['Boolean']
}

export type NotificationPreferenceGql = {
  inAppEnabled?: Maybe<Scalars['Boolean']>
  emailEnabled?: Maybe<Scalars['Boolean']>
}

export type NotificationPreferenceOutput = {
  inAppEnabled: Scalars['Boolean']
  emailEnabled: Scalars['Boolean']
}

export type NotificationPreferenceWhereInput = {
  inAppEnabled_isNull?: Maybe<Scalars['Boolean']>
  inAppEnabled_eq?: Maybe<Scalars['Boolean']>
  inAppEnabled_not_eq?: Maybe<Scalars['Boolean']>
  emailEnabled_isNull?: Maybe<Scalars['Boolean']>
  emailEnabled_eq?: Maybe<Scalars['Boolean']>
  emailEnabled_not_eq?: Maybe<Scalars['Boolean']>
}

export type NotificationType =
  | ChannelExcluded
  | VideoExcluded
  | NftFeaturedOnMarketPlace
  | NewChannelFollower
  | CommentPostedToVideo
  | VideoLiked
  | VideoDisliked
  | ChannelVerified
  | ChannelSuspended
  | NftPurchased
  | CreatorReceivesAuctionBid
  | NftRoyaltyPaid
  | DirectChannelPaymentByMember
  | ChannelFundsWithdrawn
  | ChannelCreated
  | CommentReply
  | ReactionToComment
  | VideoPosted
  | NewAuction
  | NewNftOnSale
  | HigherBidPlaced
  | AuctionWon
  | AuctionLost

export type NotificationTypeWhereInput = {
  channelTitle_isNull?: Maybe<Scalars['Boolean']>
  channelTitle_eq?: Maybe<Scalars['String']>
  channelTitle_not_eq?: Maybe<Scalars['String']>
  channelTitle_gt?: Maybe<Scalars['String']>
  channelTitle_gte?: Maybe<Scalars['String']>
  channelTitle_lt?: Maybe<Scalars['String']>
  channelTitle_lte?: Maybe<Scalars['String']>
  channelTitle_in?: Maybe<Array<Scalars['String']>>
  channelTitle_not_in?: Maybe<Array<Scalars['String']>>
  channelTitle_contains?: Maybe<Scalars['String']>
  channelTitle_not_contains?: Maybe<Scalars['String']>
  channelTitle_containsInsensitive?: Maybe<Scalars['String']>
  channelTitle_not_containsInsensitive?: Maybe<Scalars['String']>
  channelTitle_startsWith?: Maybe<Scalars['String']>
  channelTitle_not_startsWith?: Maybe<Scalars['String']>
  channelTitle_endsWith?: Maybe<Scalars['String']>
  channelTitle_not_endsWith?: Maybe<Scalars['String']>
  videoTitle_isNull?: Maybe<Scalars['Boolean']>
  videoTitle_eq?: Maybe<Scalars['String']>
  videoTitle_not_eq?: Maybe<Scalars['String']>
  videoTitle_gt?: Maybe<Scalars['String']>
  videoTitle_gte?: Maybe<Scalars['String']>
  videoTitle_lt?: Maybe<Scalars['String']>
  videoTitle_lte?: Maybe<Scalars['String']>
  videoTitle_in?: Maybe<Array<Scalars['String']>>
  videoTitle_not_in?: Maybe<Array<Scalars['String']>>
  videoTitle_contains?: Maybe<Scalars['String']>
  videoTitle_not_contains?: Maybe<Scalars['String']>
  videoTitle_containsInsensitive?: Maybe<Scalars['String']>
  videoTitle_not_containsInsensitive?: Maybe<Scalars['String']>
  videoTitle_startsWith?: Maybe<Scalars['String']>
  videoTitle_not_startsWith?: Maybe<Scalars['String']>
  videoTitle_endsWith?: Maybe<Scalars['String']>
  videoTitle_not_endsWith?: Maybe<Scalars['String']>
  videoId_isNull?: Maybe<Scalars['Boolean']>
  videoId_eq?: Maybe<Scalars['String']>
  videoId_not_eq?: Maybe<Scalars['String']>
  videoId_gt?: Maybe<Scalars['String']>
  videoId_gte?: Maybe<Scalars['String']>
  videoId_lt?: Maybe<Scalars['String']>
  videoId_lte?: Maybe<Scalars['String']>
  videoId_in?: Maybe<Array<Scalars['String']>>
  videoId_not_in?: Maybe<Array<Scalars['String']>>
  videoId_contains?: Maybe<Scalars['String']>
  videoId_not_contains?: Maybe<Scalars['String']>
  videoId_containsInsensitive?: Maybe<Scalars['String']>
  videoId_not_containsInsensitive?: Maybe<Scalars['String']>
  videoId_startsWith?: Maybe<Scalars['String']>
  videoId_not_startsWith?: Maybe<Scalars['String']>
  videoId_endsWith?: Maybe<Scalars['String']>
  videoId_not_endsWith?: Maybe<Scalars['String']>
  followerId_isNull?: Maybe<Scalars['Boolean']>
  followerId_eq?: Maybe<Scalars['String']>
  followerId_not_eq?: Maybe<Scalars['String']>
  followerId_gt?: Maybe<Scalars['String']>
  followerId_gte?: Maybe<Scalars['String']>
  followerId_lt?: Maybe<Scalars['String']>
  followerId_lte?: Maybe<Scalars['String']>
  followerId_in?: Maybe<Array<Scalars['String']>>
  followerId_not_in?: Maybe<Array<Scalars['String']>>
  followerId_contains?: Maybe<Scalars['String']>
  followerId_not_contains?: Maybe<Scalars['String']>
  followerId_containsInsensitive?: Maybe<Scalars['String']>
  followerId_not_containsInsensitive?: Maybe<Scalars['String']>
  followerId_startsWith?: Maybe<Scalars['String']>
  followerId_not_startsWith?: Maybe<Scalars['String']>
  followerId_endsWith?: Maybe<Scalars['String']>
  followerId_not_endsWith?: Maybe<Scalars['String']>
  followerHandle_isNull?: Maybe<Scalars['Boolean']>
  followerHandle_eq?: Maybe<Scalars['String']>
  followerHandle_not_eq?: Maybe<Scalars['String']>
  followerHandle_gt?: Maybe<Scalars['String']>
  followerHandle_gte?: Maybe<Scalars['String']>
  followerHandle_lt?: Maybe<Scalars['String']>
  followerHandle_lte?: Maybe<Scalars['String']>
  followerHandle_in?: Maybe<Array<Scalars['String']>>
  followerHandle_not_in?: Maybe<Array<Scalars['String']>>
  followerHandle_contains?: Maybe<Scalars['String']>
  followerHandle_not_contains?: Maybe<Scalars['String']>
  followerHandle_containsInsensitive?: Maybe<Scalars['String']>
  followerHandle_not_containsInsensitive?: Maybe<Scalars['String']>
  followerHandle_startsWith?: Maybe<Scalars['String']>
  followerHandle_not_startsWith?: Maybe<Scalars['String']>
  followerHandle_endsWith?: Maybe<Scalars['String']>
  followerHandle_not_endsWith?: Maybe<Scalars['String']>
  memberId_isNull?: Maybe<Scalars['Boolean']>
  memberId_eq?: Maybe<Scalars['String']>
  memberId_not_eq?: Maybe<Scalars['String']>
  memberId_gt?: Maybe<Scalars['String']>
  memberId_gte?: Maybe<Scalars['String']>
  memberId_lt?: Maybe<Scalars['String']>
  memberId_lte?: Maybe<Scalars['String']>
  memberId_in?: Maybe<Array<Scalars['String']>>
  memberId_not_in?: Maybe<Array<Scalars['String']>>
  memberId_contains?: Maybe<Scalars['String']>
  memberId_not_contains?: Maybe<Scalars['String']>
  memberId_containsInsensitive?: Maybe<Scalars['String']>
  memberId_not_containsInsensitive?: Maybe<Scalars['String']>
  memberId_startsWith?: Maybe<Scalars['String']>
  memberId_not_startsWith?: Maybe<Scalars['String']>
  memberId_endsWith?: Maybe<Scalars['String']>
  memberId_not_endsWith?: Maybe<Scalars['String']>
  memberHandle_isNull?: Maybe<Scalars['Boolean']>
  memberHandle_eq?: Maybe<Scalars['String']>
  memberHandle_not_eq?: Maybe<Scalars['String']>
  memberHandle_gt?: Maybe<Scalars['String']>
  memberHandle_gte?: Maybe<Scalars['String']>
  memberHandle_lt?: Maybe<Scalars['String']>
  memberHandle_lte?: Maybe<Scalars['String']>
  memberHandle_in?: Maybe<Array<Scalars['String']>>
  memberHandle_not_in?: Maybe<Array<Scalars['String']>>
  memberHandle_contains?: Maybe<Scalars['String']>
  memberHandle_not_contains?: Maybe<Scalars['String']>
  memberHandle_containsInsensitive?: Maybe<Scalars['String']>
  memberHandle_not_containsInsensitive?: Maybe<Scalars['String']>
  memberHandle_startsWith?: Maybe<Scalars['String']>
  memberHandle_not_startsWith?: Maybe<Scalars['String']>
  memberHandle_endsWith?: Maybe<Scalars['String']>
  memberHandle_not_endsWith?: Maybe<Scalars['String']>
  comentId_isNull?: Maybe<Scalars['Boolean']>
  comentId_eq?: Maybe<Scalars['String']>
  comentId_not_eq?: Maybe<Scalars['String']>
  comentId_gt?: Maybe<Scalars['String']>
  comentId_gte?: Maybe<Scalars['String']>
  comentId_lt?: Maybe<Scalars['String']>
  comentId_lte?: Maybe<Scalars['String']>
  comentId_in?: Maybe<Array<Scalars['String']>>
  comentId_not_in?: Maybe<Array<Scalars['String']>>
  comentId_contains?: Maybe<Scalars['String']>
  comentId_not_contains?: Maybe<Scalars['String']>
  comentId_containsInsensitive?: Maybe<Scalars['String']>
  comentId_not_containsInsensitive?: Maybe<Scalars['String']>
  comentId_startsWith?: Maybe<Scalars['String']>
  comentId_not_startsWith?: Maybe<Scalars['String']>
  comentId_endsWith?: Maybe<Scalars['String']>
  comentId_not_endsWith?: Maybe<Scalars['String']>
  phantom_isNull?: Maybe<Scalars['Boolean']>
  phantom_eq?: Maybe<Scalars['Int']>
  phantom_not_eq?: Maybe<Scalars['Int']>
  phantom_gt?: Maybe<Scalars['Int']>
  phantom_gte?: Maybe<Scalars['Int']>
  phantom_lt?: Maybe<Scalars['Int']>
  phantom_lte?: Maybe<Scalars['Int']>
  phantom_in?: Maybe<Array<Scalars['Int']>>
  phantom_not_in?: Maybe<Array<Scalars['Int']>>
  buyerId_isNull?: Maybe<Scalars['Boolean']>
  buyerId_eq?: Maybe<Scalars['String']>
  buyerId_not_eq?: Maybe<Scalars['String']>
  buyerId_gt?: Maybe<Scalars['String']>
  buyerId_gte?: Maybe<Scalars['String']>
  buyerId_lt?: Maybe<Scalars['String']>
  buyerId_lte?: Maybe<Scalars['String']>
  buyerId_in?: Maybe<Array<Scalars['String']>>
  buyerId_not_in?: Maybe<Array<Scalars['String']>>
  buyerId_contains?: Maybe<Scalars['String']>
  buyerId_not_contains?: Maybe<Scalars['String']>
  buyerId_containsInsensitive?: Maybe<Scalars['String']>
  buyerId_not_containsInsensitive?: Maybe<Scalars['String']>
  buyerId_startsWith?: Maybe<Scalars['String']>
  buyerId_not_startsWith?: Maybe<Scalars['String']>
  buyerId_endsWith?: Maybe<Scalars['String']>
  buyerId_not_endsWith?: Maybe<Scalars['String']>
  buyerHandle_isNull?: Maybe<Scalars['Boolean']>
  buyerHandle_eq?: Maybe<Scalars['String']>
  buyerHandle_not_eq?: Maybe<Scalars['String']>
  buyerHandle_gt?: Maybe<Scalars['String']>
  buyerHandle_gte?: Maybe<Scalars['String']>
  buyerHandle_lt?: Maybe<Scalars['String']>
  buyerHandle_lte?: Maybe<Scalars['String']>
  buyerHandle_in?: Maybe<Array<Scalars['String']>>
  buyerHandle_not_in?: Maybe<Array<Scalars['String']>>
  buyerHandle_contains?: Maybe<Scalars['String']>
  buyerHandle_not_contains?: Maybe<Scalars['String']>
  buyerHandle_containsInsensitive?: Maybe<Scalars['String']>
  buyerHandle_not_containsInsensitive?: Maybe<Scalars['String']>
  buyerHandle_startsWith?: Maybe<Scalars['String']>
  buyerHandle_not_startsWith?: Maybe<Scalars['String']>
  buyerHandle_endsWith?: Maybe<Scalars['String']>
  buyerHandle_not_endsWith?: Maybe<Scalars['String']>
  price_isNull?: Maybe<Scalars['Boolean']>
  price_eq?: Maybe<Scalars['BigInt']>
  price_not_eq?: Maybe<Scalars['BigInt']>
  price_gt?: Maybe<Scalars['BigInt']>
  price_gte?: Maybe<Scalars['BigInt']>
  price_lt?: Maybe<Scalars['BigInt']>
  price_lte?: Maybe<Scalars['BigInt']>
  price_in?: Maybe<Array<Scalars['BigInt']>>
  price_not_in?: Maybe<Array<Scalars['BigInt']>>
  bidderId_isNull?: Maybe<Scalars['Boolean']>
  bidderId_eq?: Maybe<Scalars['String']>
  bidderId_not_eq?: Maybe<Scalars['String']>
  bidderId_gt?: Maybe<Scalars['String']>
  bidderId_gte?: Maybe<Scalars['String']>
  bidderId_lt?: Maybe<Scalars['String']>
  bidderId_lte?: Maybe<Scalars['String']>
  bidderId_in?: Maybe<Array<Scalars['String']>>
  bidderId_not_in?: Maybe<Array<Scalars['String']>>
  bidderId_contains?: Maybe<Scalars['String']>
  bidderId_not_contains?: Maybe<Scalars['String']>
  bidderId_containsInsensitive?: Maybe<Scalars['String']>
  bidderId_not_containsInsensitive?: Maybe<Scalars['String']>
  bidderId_startsWith?: Maybe<Scalars['String']>
  bidderId_not_startsWith?: Maybe<Scalars['String']>
  bidderId_endsWith?: Maybe<Scalars['String']>
  bidderId_not_endsWith?: Maybe<Scalars['String']>
  bidderHandle_isNull?: Maybe<Scalars['Boolean']>
  bidderHandle_eq?: Maybe<Scalars['String']>
  bidderHandle_not_eq?: Maybe<Scalars['String']>
  bidderHandle_gt?: Maybe<Scalars['String']>
  bidderHandle_gte?: Maybe<Scalars['String']>
  bidderHandle_lt?: Maybe<Scalars['String']>
  bidderHandle_lte?: Maybe<Scalars['String']>
  bidderHandle_in?: Maybe<Array<Scalars['String']>>
  bidderHandle_not_in?: Maybe<Array<Scalars['String']>>
  bidderHandle_contains?: Maybe<Scalars['String']>
  bidderHandle_not_contains?: Maybe<Scalars['String']>
  bidderHandle_containsInsensitive?: Maybe<Scalars['String']>
  bidderHandle_not_containsInsensitive?: Maybe<Scalars['String']>
  bidderHandle_startsWith?: Maybe<Scalars['String']>
  bidderHandle_not_startsWith?: Maybe<Scalars['String']>
  bidderHandle_endsWith?: Maybe<Scalars['String']>
  bidderHandle_not_endsWith?: Maybe<Scalars['String']>
  amount_isNull?: Maybe<Scalars['Boolean']>
  amount_eq?: Maybe<Scalars['BigInt']>
  amount_not_eq?: Maybe<Scalars['BigInt']>
  amount_gt?: Maybe<Scalars['BigInt']>
  amount_gte?: Maybe<Scalars['BigInt']>
  amount_lt?: Maybe<Scalars['BigInt']>
  amount_lte?: Maybe<Scalars['BigInt']>
  amount_in?: Maybe<Array<Scalars['BigInt']>>
  amount_not_in?: Maybe<Array<Scalars['BigInt']>>
  payerId_isNull?: Maybe<Scalars['Boolean']>
  payerId_eq?: Maybe<Scalars['String']>
  payerId_not_eq?: Maybe<Scalars['String']>
  payerId_gt?: Maybe<Scalars['String']>
  payerId_gte?: Maybe<Scalars['String']>
  payerId_lt?: Maybe<Scalars['String']>
  payerId_lte?: Maybe<Scalars['String']>
  payerId_in?: Maybe<Array<Scalars['String']>>
  payerId_not_in?: Maybe<Array<Scalars['String']>>
  payerId_contains?: Maybe<Scalars['String']>
  payerId_not_contains?: Maybe<Scalars['String']>
  payerId_containsInsensitive?: Maybe<Scalars['String']>
  payerId_not_containsInsensitive?: Maybe<Scalars['String']>
  payerId_startsWith?: Maybe<Scalars['String']>
  payerId_not_startsWith?: Maybe<Scalars['String']>
  payerId_endsWith?: Maybe<Scalars['String']>
  payerId_not_endsWith?: Maybe<Scalars['String']>
  payerHandle_isNull?: Maybe<Scalars['Boolean']>
  payerHandle_eq?: Maybe<Scalars['String']>
  payerHandle_not_eq?: Maybe<Scalars['String']>
  payerHandle_gt?: Maybe<Scalars['String']>
  payerHandle_gte?: Maybe<Scalars['String']>
  payerHandle_lt?: Maybe<Scalars['String']>
  payerHandle_lte?: Maybe<Scalars['String']>
  payerHandle_in?: Maybe<Array<Scalars['String']>>
  payerHandle_not_in?: Maybe<Array<Scalars['String']>>
  payerHandle_contains?: Maybe<Scalars['String']>
  payerHandle_not_contains?: Maybe<Scalars['String']>
  payerHandle_containsInsensitive?: Maybe<Scalars['String']>
  payerHandle_not_containsInsensitive?: Maybe<Scalars['String']>
  payerHandle_startsWith?: Maybe<Scalars['String']>
  payerHandle_not_startsWith?: Maybe<Scalars['String']>
  payerHandle_endsWith?: Maybe<Scalars['String']>
  payerHandle_not_endsWith?: Maybe<Scalars['String']>
  channelId_isNull?: Maybe<Scalars['Boolean']>
  channelId_eq?: Maybe<Scalars['String']>
  channelId_not_eq?: Maybe<Scalars['String']>
  channelId_gt?: Maybe<Scalars['String']>
  channelId_gte?: Maybe<Scalars['String']>
  channelId_lt?: Maybe<Scalars['String']>
  channelId_lte?: Maybe<Scalars['String']>
  channelId_in?: Maybe<Array<Scalars['String']>>
  channelId_not_in?: Maybe<Array<Scalars['String']>>
  channelId_contains?: Maybe<Scalars['String']>
  channelId_not_contains?: Maybe<Scalars['String']>
  channelId_containsInsensitive?: Maybe<Scalars['String']>
  channelId_not_containsInsensitive?: Maybe<Scalars['String']>
  channelId_startsWith?: Maybe<Scalars['String']>
  channelId_not_startsWith?: Maybe<Scalars['String']>
  channelId_endsWith?: Maybe<Scalars['String']>
  channelId_not_endsWith?: Maybe<Scalars['String']>
  commentId_isNull?: Maybe<Scalars['Boolean']>
  commentId_eq?: Maybe<Scalars['String']>
  commentId_not_eq?: Maybe<Scalars['String']>
  commentId_gt?: Maybe<Scalars['String']>
  commentId_gte?: Maybe<Scalars['String']>
  commentId_lt?: Maybe<Scalars['String']>
  commentId_lte?: Maybe<Scalars['String']>
  commentId_in?: Maybe<Array<Scalars['String']>>
  commentId_not_in?: Maybe<Array<Scalars['String']>>
  commentId_contains?: Maybe<Scalars['String']>
  commentId_not_contains?: Maybe<Scalars['String']>
  commentId_containsInsensitive?: Maybe<Scalars['String']>
  commentId_not_containsInsensitive?: Maybe<Scalars['String']>
  commentId_startsWith?: Maybe<Scalars['String']>
  commentId_not_startsWith?: Maybe<Scalars['String']>
  commentId_endsWith?: Maybe<Scalars['String']>
  commentId_not_endsWith?: Maybe<Scalars['String']>
  newBidderId_isNull?: Maybe<Scalars['Boolean']>
  newBidderId_eq?: Maybe<Scalars['String']>
  newBidderId_not_eq?: Maybe<Scalars['String']>
  newBidderId_gt?: Maybe<Scalars['String']>
  newBidderId_gte?: Maybe<Scalars['String']>
  newBidderId_lt?: Maybe<Scalars['String']>
  newBidderId_lte?: Maybe<Scalars['String']>
  newBidderId_in?: Maybe<Array<Scalars['String']>>
  newBidderId_not_in?: Maybe<Array<Scalars['String']>>
  newBidderId_contains?: Maybe<Scalars['String']>
  newBidderId_not_contains?: Maybe<Scalars['String']>
  newBidderId_containsInsensitive?: Maybe<Scalars['String']>
  newBidderId_not_containsInsensitive?: Maybe<Scalars['String']>
  newBidderId_startsWith?: Maybe<Scalars['String']>
  newBidderId_not_startsWith?: Maybe<Scalars['String']>
  newBidderId_endsWith?: Maybe<Scalars['String']>
  newBidderId_not_endsWith?: Maybe<Scalars['String']>
  newBidderHandle_isNull?: Maybe<Scalars['Boolean']>
  newBidderHandle_eq?: Maybe<Scalars['String']>
  newBidderHandle_not_eq?: Maybe<Scalars['String']>
  newBidderHandle_gt?: Maybe<Scalars['String']>
  newBidderHandle_gte?: Maybe<Scalars['String']>
  newBidderHandle_lt?: Maybe<Scalars['String']>
  newBidderHandle_lte?: Maybe<Scalars['String']>
  newBidderHandle_in?: Maybe<Array<Scalars['String']>>
  newBidderHandle_not_in?: Maybe<Array<Scalars['String']>>
  newBidderHandle_contains?: Maybe<Scalars['String']>
  newBidderHandle_not_contains?: Maybe<Scalars['String']>
  newBidderHandle_containsInsensitive?: Maybe<Scalars['String']>
  newBidderHandle_not_containsInsensitive?: Maybe<Scalars['String']>
  newBidderHandle_startsWith?: Maybe<Scalars['String']>
  newBidderHandle_not_startsWith?: Maybe<Scalars['String']>
  newBidderHandle_endsWith?: Maybe<Scalars['String']>
  newBidderHandle_not_endsWith?: Maybe<Scalars['String']>
  type_isNull?: Maybe<Scalars['Boolean']>
  type?: Maybe<AuctionTypeWhereInput>
  isTypeOf_isNull?: Maybe<Scalars['Boolean']>
  isTypeOf_eq?: Maybe<Scalars['String']>
  isTypeOf_not_eq?: Maybe<Scalars['String']>
  isTypeOf_gt?: Maybe<Scalars['String']>
  isTypeOf_gte?: Maybe<Scalars['String']>
  isTypeOf_lt?: Maybe<Scalars['String']>
  isTypeOf_lte?: Maybe<Scalars['String']>
  isTypeOf_in?: Maybe<Array<Scalars['String']>>
  isTypeOf_not_in?: Maybe<Array<Scalars['String']>>
  isTypeOf_contains?: Maybe<Scalars['String']>
  isTypeOf_not_contains?: Maybe<Scalars['String']>
  isTypeOf_containsInsensitive?: Maybe<Scalars['String']>
  isTypeOf_not_containsInsensitive?: Maybe<Scalars['String']>
  isTypeOf_startsWith?: Maybe<Scalars['String']>
  isTypeOf_not_startsWith?: Maybe<Scalars['String']>
  isTypeOf_endsWith?: Maybe<Scalars['String']>
  isTypeOf_not_endsWith?: Maybe<Scalars['String']>
}

export type NotificationWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  account_isNull?: Maybe<Scalars['Boolean']>
  account?: Maybe<AccountWhereInput>
  notificationType_isNull?: Maybe<Scalars['Boolean']>
  notificationType?: Maybe<NotificationTypeWhereInput>
  event_isNull?: Maybe<Scalars['Boolean']>
  event?: Maybe<EventWhereInput>
  status_isNull?: Maybe<Scalars['Boolean']>
  status?: Maybe<ReadOrUnreadWhereInput>
  inApp_isNull?: Maybe<Scalars['Boolean']>
  inApp_eq?: Maybe<Scalars['Boolean']>
  inApp_not_eq?: Maybe<Scalars['Boolean']>
  createdAt_isNull?: Maybe<Scalars['Boolean']>
  createdAt_eq?: Maybe<Scalars['DateTime']>
  createdAt_not_eq?: Maybe<Scalars['DateTime']>
  createdAt_gt?: Maybe<Scalars['DateTime']>
  createdAt_gte?: Maybe<Scalars['DateTime']>
  createdAt_lt?: Maybe<Scalars['DateTime']>
  createdAt_lte?: Maybe<Scalars['DateTime']>
  createdAt_in?: Maybe<Array<Scalars['DateTime']>>
  createdAt_not_in?: Maybe<Array<Scalars['DateTime']>>
  recipient_isNull?: Maybe<Scalars['Boolean']>
  recipient?: Maybe<RecipientTypeWhereInput>
  AND?: Maybe<Array<NotificationWhereInput>>
  OR?: Maybe<Array<NotificationWhereInput>>
}

export type NotificationsConnection = {
  edges: Array<NotificationEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type OpenAuctionBidAcceptedEventData = {
  /** Content actor that accepted the bid. */
  actor: ContentActor
  /** Accepted/winning bid */
  winningBid: Bid
  /** NFT owner before the auction was completed */
  previousNftOwner: NftOwner
}

export type OpenAuctionStartedEventData = {
  /** Actor that started this auction. */
  actor: ContentActor
  /** Auction started. */
  auction: Auction
  /** owner of the NFT being auctioned */
  nftOwner: NftOwner
}

export enum OperatorPermission {
  GrantOperatorPermissions = 'GRANT_OPERATOR_PERMISSIONS',
  RevokeOperatorPermissions = 'REVOKE_OPERATOR_PERMISSIONS',
  SetVideoWeights = 'SET_VIDEO_WEIGHTS',
  SetChannelWeights = 'SET_CHANNEL_WEIGHTS',
  SetKillSwitch = 'SET_KILL_SWITCH',
  SetVideoViewPerUserTimeLimit = 'SET_VIDEO_VIEW_PER_USER_TIME_LIMIT',
  SetVideoHero = 'SET_VIDEO_HERO',
  SetCategoryFeaturedVideos = 'SET_CATEGORY_FEATURED_VIDEOS',
  SetSupportedCategories = 'SET_SUPPORTED_CATEGORIES',
  SetFeaturedNfts = 'SET_FEATURED_NFTS',
  ExcludeContent = 'EXCLUDE_CONTENT',
  RestoreContent = 'RESTORE_CONTENT',
  SetPublicFeedVideos = 'SET_PUBLIC_FEED_VIDEOS',
}

/** Represents NFT details */
export type OwnedNft = {
  id: Scalars['String']
  /** Timestamp of the block the NFT was created at */
  createdAt: Scalars['DateTime']
  /** NFT's video */
  video: Video
  /** Auctions done for this NFT */
  auctions: Array<Auction>
  /** Current owner of the NFT. */
  owner: NftOwner
  /** NFT's transactional status */
  transactionalStatus?: Maybe<TransactionalStatus>
  /** Creator royalty (if any) */
  creatorRoyalty?: Maybe<Scalars['Float']>
  /** NFT's last sale price (if any) */
  lastSalePrice?: Maybe<Scalars['BigInt']>
  /** NFT's last sale date (if any) */
  lastSaleDate?: Maybe<Scalars['DateTime']>
  /** All NFT auction bids */
  bids: Array<Bid>
  /** Flag to indicate whether the NFT is featured or not */
  isFeatured: Scalars['Boolean']
}

/** Represents NFT details */
export type OwnedNftAuctionsArgs = {
  where?: Maybe<AuctionWhereInput>
  orderBy?: Maybe<Array<AuctionOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

/** Represents NFT details */
export type OwnedNftBidsArgs = {
  where?: Maybe<BidWhereInput>
  orderBy?: Maybe<Array<BidOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type OwnedNftEdge = {
  node: OwnedNft
  cursor: Scalars['String']
}

export enum OwnedNftOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  CreatedAtAsc = 'createdAt_ASC',
  CreatedAtDesc = 'createdAt_DESC',
  VideoIdAsc = 'video_id_ASC',
  VideoIdDesc = 'video_id_DESC',
  VideoCreatedAtAsc = 'video_createdAt_ASC',
  VideoCreatedAtDesc = 'video_createdAt_DESC',
  VideoTitleAsc = 'video_title_ASC',
  VideoTitleDesc = 'video_title_DESC',
  VideoDescriptionAsc = 'video_description_ASC',
  VideoDescriptionDesc = 'video_description_DESC',
  VideoDurationAsc = 'video_duration_ASC',
  VideoDurationDesc = 'video_duration_DESC',
  VideoLanguageAsc = 'video_language_ASC',
  VideoLanguageDesc = 'video_language_DESC',
  VideoOrionLanguageAsc = 'video_orionLanguage_ASC',
  VideoOrionLanguageDesc = 'video_orionLanguage_DESC',
  VideoHasMarketingAsc = 'video_hasMarketing_ASC',
  VideoHasMarketingDesc = 'video_hasMarketing_DESC',
  VideoPublishedBeforeJoystreamAsc = 'video_publishedBeforeJoystream_ASC',
  VideoPublishedBeforeJoystreamDesc = 'video_publishedBeforeJoystream_DESC',
  VideoIsPublicAsc = 'video_isPublic_ASC',
  VideoIsPublicDesc = 'video_isPublic_DESC',
  VideoIsCensoredAsc = 'video_isCensored_ASC',
  VideoIsCensoredDesc = 'video_isCensored_DESC',
  VideoIsExcludedAsc = 'video_isExcluded_ASC',
  VideoIsExcludedDesc = 'video_isExcluded_DESC',
  VideoIsExplicitAsc = 'video_isExplicit_ASC',
  VideoIsExplicitDesc = 'video_isExplicit_DESC',
  VideoVideoStateBloatBondAsc = 'video_videoStateBloatBond_ASC',
  VideoVideoStateBloatBondDesc = 'video_videoStateBloatBond_DESC',
  VideoCreatedInBlockAsc = 'video_createdInBlock_ASC',
  VideoCreatedInBlockDesc = 'video_createdInBlock_DESC',
  VideoIsCommentSectionEnabledAsc = 'video_isCommentSectionEnabled_ASC',
  VideoIsCommentSectionEnabledDesc = 'video_isCommentSectionEnabled_DESC',
  VideoCommentsCountAsc = 'video_commentsCount_ASC',
  VideoCommentsCountDesc = 'video_commentsCount_DESC',
  VideoIsReactionFeatureEnabledAsc = 'video_isReactionFeatureEnabled_ASC',
  VideoIsReactionFeatureEnabledDesc = 'video_isReactionFeatureEnabled_DESC',
  VideoReactionsCountAsc = 'video_reactionsCount_ASC',
  VideoReactionsCountDesc = 'video_reactionsCount_DESC',
  VideoViewsNumAsc = 'video_viewsNum_ASC',
  VideoViewsNumDesc = 'video_viewsNum_DESC',
  VideoYtVideoIdAsc = 'video_ytVideoId_ASC',
  VideoYtVideoIdDesc = 'video_ytVideoId_DESC',
  VideoVideoRelevanceAsc = 'video_videoRelevance_ASC',
  VideoVideoRelevanceDesc = 'video_videoRelevance_DESC',
  VideoIsShortAsc = 'video_isShort_ASC',
  VideoIsShortDesc = 'video_isShort_DESC',
  VideoIncludeInHomeFeedAsc = 'video_includeInHomeFeed_ASC',
  VideoIncludeInHomeFeedDesc = 'video_includeInHomeFeed_DESC',
  OwnerIsTypeOfAsc = 'owner_isTypeOf_ASC',
  OwnerIsTypeOfDesc = 'owner_isTypeOf_DESC',
  TransactionalStatusPhantomAsc = 'transactionalStatus_phantom_ASC',
  TransactionalStatusPhantomDesc = 'transactionalStatus_phantom_DESC',
  TransactionalStatusPriceAsc = 'transactionalStatus_price_ASC',
  TransactionalStatusPriceDesc = 'transactionalStatus_price_DESC',
  TransactionalStatusIsTypeOfAsc = 'transactionalStatus_isTypeOf_ASC',
  TransactionalStatusIsTypeOfDesc = 'transactionalStatus_isTypeOf_DESC',
  CreatorRoyaltyAsc = 'creatorRoyalty_ASC',
  CreatorRoyaltyDesc = 'creatorRoyalty_DESC',
  LastSalePriceAsc = 'lastSalePrice_ASC',
  LastSalePriceDesc = 'lastSalePrice_DESC',
  LastSaleDateAsc = 'lastSaleDate_ASC',
  LastSaleDateDesc = 'lastSaleDate_DESC',
  IsFeaturedAsc = 'isFeatured_ASC',
  IsFeaturedDesc = 'isFeatured_DESC',
}

export type OwnedNftWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  createdAt_isNull?: Maybe<Scalars['Boolean']>
  createdAt_eq?: Maybe<Scalars['DateTime']>
  createdAt_not_eq?: Maybe<Scalars['DateTime']>
  createdAt_gt?: Maybe<Scalars['DateTime']>
  createdAt_gte?: Maybe<Scalars['DateTime']>
  createdAt_lt?: Maybe<Scalars['DateTime']>
  createdAt_lte?: Maybe<Scalars['DateTime']>
  createdAt_in?: Maybe<Array<Scalars['DateTime']>>
  createdAt_not_in?: Maybe<Array<Scalars['DateTime']>>
  video_isNull?: Maybe<Scalars['Boolean']>
  video?: Maybe<VideoWhereInput>
  auctions_every?: Maybe<AuctionWhereInput>
  auctions_some?: Maybe<AuctionWhereInput>
  auctions_none?: Maybe<AuctionWhereInput>
  owner_isNull?: Maybe<Scalars['Boolean']>
  owner?: Maybe<NftOwnerWhereInput>
  transactionalStatus_isNull?: Maybe<Scalars['Boolean']>
  transactionalStatus?: Maybe<TransactionalStatusWhereInput>
  creatorRoyalty_isNull?: Maybe<Scalars['Boolean']>
  creatorRoyalty_eq?: Maybe<Scalars['Float']>
  creatorRoyalty_not_eq?: Maybe<Scalars['Float']>
  creatorRoyalty_gt?: Maybe<Scalars['Float']>
  creatorRoyalty_gte?: Maybe<Scalars['Float']>
  creatorRoyalty_lt?: Maybe<Scalars['Float']>
  creatorRoyalty_lte?: Maybe<Scalars['Float']>
  creatorRoyalty_in?: Maybe<Array<Scalars['Float']>>
  creatorRoyalty_not_in?: Maybe<Array<Scalars['Float']>>
  lastSalePrice_isNull?: Maybe<Scalars['Boolean']>
  lastSalePrice_eq?: Maybe<Scalars['BigInt']>
  lastSalePrice_not_eq?: Maybe<Scalars['BigInt']>
  lastSalePrice_gt?: Maybe<Scalars['BigInt']>
  lastSalePrice_gte?: Maybe<Scalars['BigInt']>
  lastSalePrice_lt?: Maybe<Scalars['BigInt']>
  lastSalePrice_lte?: Maybe<Scalars['BigInt']>
  lastSalePrice_in?: Maybe<Array<Scalars['BigInt']>>
  lastSalePrice_not_in?: Maybe<Array<Scalars['BigInt']>>
  lastSaleDate_isNull?: Maybe<Scalars['Boolean']>
  lastSaleDate_eq?: Maybe<Scalars['DateTime']>
  lastSaleDate_not_eq?: Maybe<Scalars['DateTime']>
  lastSaleDate_gt?: Maybe<Scalars['DateTime']>
  lastSaleDate_gte?: Maybe<Scalars['DateTime']>
  lastSaleDate_lt?: Maybe<Scalars['DateTime']>
  lastSaleDate_lte?: Maybe<Scalars['DateTime']>
  lastSaleDate_in?: Maybe<Array<Scalars['DateTime']>>
  lastSaleDate_not_in?: Maybe<Array<Scalars['DateTime']>>
  bids_every?: Maybe<BidWhereInput>
  bids_some?: Maybe<BidWhereInput>
  bids_none?: Maybe<BidWhereInput>
  isFeatured_isNull?: Maybe<Scalars['Boolean']>
  isFeatured_eq?: Maybe<Scalars['Boolean']>
  isFeatured_not_eq?: Maybe<Scalars['Boolean']>
  AND?: Maybe<Array<OwnedNftWhereInput>>
  OR?: Maybe<Array<OwnedNftWhereInput>>
}

export type OwnedNftsConnection = {
  edges: Array<OwnedNftEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type PageInfo = {
  hasNextPage: Scalars['Boolean']
  hasPreviousPage: Scalars['Boolean']
  startCursor: Scalars['String']
  endCursor: Scalars['String']
}

/** Various Channel Payment Contexts */
export type PaymentContext = PaymentContextVideo | PaymentContextChannel

export type PaymentContextChannel = {
  /** Channel for which the payment was made */
  channel: Channel
}

export type PaymentContextVideo = {
  /** Video for which the payment was made */
  video: Video
}

export type PaymentContextWhereInput = {
  video_isNull?: Maybe<Scalars['Boolean']>
  video?: Maybe<VideoWhereInput>
  channel_isNull?: Maybe<Scalars['Boolean']>
  channel?: Maybe<ChannelWhereInput>
  isTypeOf_isNull?: Maybe<Scalars['Boolean']>
  isTypeOf_eq?: Maybe<Scalars['String']>
  isTypeOf_not_eq?: Maybe<Scalars['String']>
  isTypeOf_gt?: Maybe<Scalars['String']>
  isTypeOf_gte?: Maybe<Scalars['String']>
  isTypeOf_lt?: Maybe<Scalars['String']>
  isTypeOf_lte?: Maybe<Scalars['String']>
  isTypeOf_in?: Maybe<Array<Scalars['String']>>
  isTypeOf_not_in?: Maybe<Array<Scalars['String']>>
  isTypeOf_contains?: Maybe<Scalars['String']>
  isTypeOf_not_contains?: Maybe<Scalars['String']>
  isTypeOf_containsInsensitive?: Maybe<Scalars['String']>
  isTypeOf_not_containsInsensitive?: Maybe<Scalars['String']>
  isTypeOf_startsWith?: Maybe<Scalars['String']>
  isTypeOf_not_startsWith?: Maybe<Scalars['String']>
  isTypeOf_endsWith?: Maybe<Scalars['String']>
  isTypeOf_not_endsWith?: Maybe<Scalars['String']>
}

export type ProcessorState = {
  lastProcessedBlock: Scalars['Int']
}

export enum PublicFeedOperationType {
  Set = 'SET',
  Unset = 'UNSET',
}

export type Query = {
  getKillSwitch: KillSwitch
  videoHero?: Maybe<VideoHero>
  extendedChannels: Array<ExtendedChannel>
  mostRecentChannels: Array<ExtendedChannel>
  topSellingChannels: Array<TopSellingChannelsResult>
  channelNftCollectors: Array<ChannelNftCollector>
  extendedVideoCategories: Array<ExtendedVideoCategory>
  mostViewedVideosConnection: VideosConnection
  dumbPublicFeedVideos: Array<Video>
  endingAuctionsNfts: Array<OwnedNft>
  accountData: AccountData
  users: Array<User>
  userById?: Maybe<User>
  /** @deprecated Use userById */
  userByUniqueInput?: Maybe<User>
  usersConnection: UsersConnection
  encryptionArtifacts: Array<EncryptionArtifacts>
  encryptionArtifactsById?: Maybe<EncryptionArtifacts>
  /** @deprecated Use encryptionArtifactsById */
  encryptionArtifactsByUniqueInput?: Maybe<EncryptionArtifacts>
  encryptionArtifactsConnection: EncryptionArtifactsConnection
  sessionEncryptionArtifacts: Array<SessionEncryptionArtifacts>
  sessionEncryptionArtifactsById?: Maybe<SessionEncryptionArtifacts>
  /** @deprecated Use sessionEncryptionArtifactsById */
  sessionEncryptionArtifactsByUniqueInput?: Maybe<SessionEncryptionArtifacts>
  sessionEncryptionArtifactsConnection: SessionEncryptionArtifactsConnection
  sessions: Array<Session>
  sessionById?: Maybe<Session>
  /** @deprecated Use sessionById */
  sessionByUniqueInput?: Maybe<Session>
  sessionsConnection: SessionsConnection
  accounts: Array<Account>
  accountById?: Maybe<Account>
  /** @deprecated Use accountById */
  accountByUniqueInput?: Maybe<Account>
  accountsConnection: AccountsConnection
  tokens: Array<Token>
  tokenById?: Maybe<Token>
  /** @deprecated Use tokenById */
  tokenByUniqueInput?: Maybe<Token>
  tokensConnection: TokensConnection
  events: Array<Event>
  eventById?: Maybe<Event>
  /** @deprecated Use eventById */
  eventByUniqueInput?: Maybe<Event>
  eventsConnection: EventsConnection
  nftHistoryEntries: Array<NftHistoryEntry>
  nftHistoryEntryById?: Maybe<NftHistoryEntry>
  /** @deprecated Use nftHistoryEntryById */
  nftHistoryEntryByUniqueInput?: Maybe<NftHistoryEntry>
  nftHistoryEntriesConnection: NftHistoryEntriesConnection
  nftActivities: Array<NftActivity>
  nftActivityById?: Maybe<NftActivity>
  /** @deprecated Use nftActivityById */
  nftActivityByUniqueInput?: Maybe<NftActivity>
  nftActivitiesConnection: NftActivitiesConnection
  notificationEmailDeliveries: Array<NotificationEmailDelivery>
  notificationEmailDeliveryById?: Maybe<NotificationEmailDelivery>
  /** @deprecated Use notificationEmailDeliveryById */
  notificationEmailDeliveryByUniqueInput?: Maybe<NotificationEmailDelivery>
  notificationEmailDeliveriesConnection: NotificationEmailDeliveriesConnection
  emailDeliveryAttempts: Array<EmailDeliveryAttempt>
  emailDeliveryAttemptById?: Maybe<EmailDeliveryAttempt>
  /** @deprecated Use emailDeliveryAttemptById */
  emailDeliveryAttemptByUniqueInput?: Maybe<EmailDeliveryAttempt>
  emailDeliveryAttemptsConnection: EmailDeliveryAttemptsConnection
  notifications: Array<Notification>
  notificationById?: Maybe<Notification>
  /** @deprecated Use notificationById */
  notificationByUniqueInput?: Maybe<Notification>
  notificationsConnection: NotificationsConnection
  videoCategories: Array<VideoCategory>
  videoCategoryById?: Maybe<VideoCategory>
  /** @deprecated Use videoCategoryById */
  videoCategoryByUniqueInput?: Maybe<VideoCategory>
  videoCategoriesConnection: VideoCategoriesConnection
  videos: Array<Video>
  videoById?: Maybe<Video>
  /** @deprecated Use videoById */
  videoByUniqueInput?: Maybe<Video>
  videosConnection: VideosConnection
  videoFeaturedInCategories: Array<VideoFeaturedInCategory>
  videoFeaturedInCategoryById?: Maybe<VideoFeaturedInCategory>
  /** @deprecated Use videoFeaturedInCategoryById */
  videoFeaturedInCategoryByUniqueInput?: Maybe<VideoFeaturedInCategory>
  videoFeaturedInCategoriesConnection: VideoFeaturedInCategoriesConnection
  videoHeros: Array<VideoHero>
  videoHeroById?: Maybe<VideoHero>
  /** @deprecated Use videoHeroById */
  videoHeroByUniqueInput?: Maybe<VideoHero>
  videoHerosConnection: VideoHerosConnection
  videoMediaMetadata: Array<VideoMediaMetadata>
  videoMediaMetadataById?: Maybe<VideoMediaMetadata>
  /** @deprecated Use videoMediaMetadataById */
  videoMediaMetadataByUniqueInput?: Maybe<VideoMediaMetadata>
  videoMediaMetadataConnection: VideoMediaMetadataConnection
  videoMediaEncodings: Array<VideoMediaEncoding>
  videoMediaEncodingById?: Maybe<VideoMediaEncoding>
  /** @deprecated Use videoMediaEncodingById */
  videoMediaEncodingByUniqueInput?: Maybe<VideoMediaEncoding>
  videoMediaEncodingsConnection: VideoMediaEncodingsConnection
  licenses: Array<License>
  licenseById?: Maybe<License>
  /** @deprecated Use licenseById */
  licenseByUniqueInput?: Maybe<License>
  licensesConnection: LicensesConnection
  videoSubtitles: Array<VideoSubtitle>
  videoSubtitleById?: Maybe<VideoSubtitle>
  /** @deprecated Use videoSubtitleById */
  videoSubtitleByUniqueInput?: Maybe<VideoSubtitle>
  videoSubtitlesConnection: VideoSubtitlesConnection
  videoReactions: Array<VideoReaction>
  videoReactionById?: Maybe<VideoReaction>
  /** @deprecated Use videoReactionById */
  videoReactionByUniqueInput?: Maybe<VideoReaction>
  videoReactionsConnection: VideoReactionsConnection
  videoViewEvents: Array<VideoViewEvent>
  videoViewEventById?: Maybe<VideoViewEvent>
  /** @deprecated Use videoViewEventById */
  videoViewEventByUniqueInput?: Maybe<VideoViewEvent>
  videoViewEventsConnection: VideoViewEventsConnection
  reports: Array<Report>
  reportById?: Maybe<Report>
  /** @deprecated Use reportById */
  reportByUniqueInput?: Maybe<Report>
  reportsConnection: ReportsConnection
  nftFeaturingRequests: Array<NftFeaturingRequest>
  nftFeaturingRequestById?: Maybe<NftFeaturingRequest>
  /** @deprecated Use nftFeaturingRequestById */
  nftFeaturingRequestByUniqueInput?: Maybe<NftFeaturingRequest>
  nftFeaturingRequestsConnection: NftFeaturingRequestsConnection
  channelFollows: Array<ChannelFollow>
  channelFollowById?: Maybe<ChannelFollow>
  /** @deprecated Use channelFollowById */
  channelFollowByUniqueInput?: Maybe<ChannelFollow>
  channelFollowsConnection: ChannelFollowsConnection
  gatewayConfigs: Array<GatewayConfig>
  gatewayConfigById?: Maybe<GatewayConfig>
  /** @deprecated Use gatewayConfigById */
  gatewayConfigByUniqueInput?: Maybe<GatewayConfig>
  gatewayConfigsConnection: GatewayConfigsConnection
  exclusions: Array<Exclusion>
  exclusionById?: Maybe<Exclusion>
  /** @deprecated Use exclusionById */
  exclusionByUniqueInput?: Maybe<Exclusion>
  exclusionsConnection: ExclusionsConnection
  storageBucketOperatorMetadata: Array<StorageBucketOperatorMetadata>
  storageBucketOperatorMetadataById?: Maybe<StorageBucketOperatorMetadata>
  /** @deprecated Use storageBucketOperatorMetadataById */
  storageBucketOperatorMetadataByUniqueInput?: Maybe<StorageBucketOperatorMetadata>
  storageBucketOperatorMetadataConnection: StorageBucketOperatorMetadataConnection
  storageBuckets: Array<StorageBucket>
  storageBucketById?: Maybe<StorageBucket>
  /** @deprecated Use storageBucketById */
  storageBucketByUniqueInput?: Maybe<StorageBucket>
  storageBucketsConnection: StorageBucketsConnection
  storageBags: Array<StorageBag>
  storageBagById?: Maybe<StorageBag>
  /** @deprecated Use storageBagById */
  storageBagByUniqueInput?: Maybe<StorageBag>
  storageBagsConnection: StorageBagsConnection
  storageBucketBags: Array<StorageBucketBag>
  storageBucketBagById?: Maybe<StorageBucketBag>
  /** @deprecated Use storageBucketBagById */
  storageBucketBagByUniqueInput?: Maybe<StorageBucketBag>
  storageBucketBagsConnection: StorageBucketBagsConnection
  distributionBucketBags: Array<DistributionBucketBag>
  distributionBucketBagById?: Maybe<DistributionBucketBag>
  /** @deprecated Use distributionBucketBagById */
  distributionBucketBagByUniqueInput?: Maybe<DistributionBucketBag>
  distributionBucketBagsConnection: DistributionBucketBagsConnection
  storageDataObjects: Array<StorageDataObject>
  storageDataObjectById?: Maybe<StorageDataObject>
  /** @deprecated Use storageDataObjectById */
  storageDataObjectByUniqueInput?: Maybe<StorageDataObject>
  storageDataObjectsConnection: StorageDataObjectsConnection
  distributionBucketFamilyMetadata: Array<DistributionBucketFamilyMetadata>
  distributionBucketFamilyMetadataById?: Maybe<DistributionBucketFamilyMetadata>
  /** @deprecated Use distributionBucketFamilyMetadataById */
  distributionBucketFamilyMetadataByUniqueInput?: Maybe<DistributionBucketFamilyMetadata>
  distributionBucketFamilyMetadataConnection: DistributionBucketFamilyMetadataConnection
  distributionBucketOperatorMetadata: Array<DistributionBucketOperatorMetadata>
  distributionBucketOperatorMetadataById?: Maybe<DistributionBucketOperatorMetadata>
  /** @deprecated Use distributionBucketOperatorMetadataById */
  distributionBucketOperatorMetadataByUniqueInput?: Maybe<DistributionBucketOperatorMetadata>
  distributionBucketOperatorMetadataConnection: DistributionBucketOperatorMetadataConnection
  distributionBucketOperators: Array<DistributionBucketOperator>
  distributionBucketOperatorById?: Maybe<DistributionBucketOperator>
  /** @deprecated Use distributionBucketOperatorById */
  distributionBucketOperatorByUniqueInput?: Maybe<DistributionBucketOperator>
  distributionBucketOperatorsConnection: DistributionBucketOperatorsConnection
  distributionBuckets: Array<DistributionBucket>
  distributionBucketById?: Maybe<DistributionBucket>
  /** @deprecated Use distributionBucketById */
  distributionBucketByUniqueInput?: Maybe<DistributionBucket>
  distributionBucketsConnection: DistributionBucketsConnection
  distributionBucketFamilies: Array<DistributionBucketFamily>
  distributionBucketFamilyById?: Maybe<DistributionBucketFamily>
  /** @deprecated Use distributionBucketFamilyById */
  distributionBucketFamilyByUniqueInput?: Maybe<DistributionBucketFamily>
  distributionBucketFamiliesConnection: DistributionBucketFamiliesConnection
  channels: Array<Channel>
  channelById?: Maybe<Channel>
  /** @deprecated Use channelById */
  channelByUniqueInput?: Maybe<Channel>
  channelsConnection: ChannelsConnection
  bannedMembers: Array<BannedMember>
  bannedMemberById?: Maybe<BannedMember>
  /** @deprecated Use bannedMemberById */
  bannedMemberByUniqueInput?: Maybe<BannedMember>
  bannedMembersConnection: BannedMembersConnection
  channelVerifications: Array<ChannelVerification>
  channelVerificationById?: Maybe<ChannelVerification>
  /** @deprecated Use channelVerificationById */
  channelVerificationByUniqueInput?: Maybe<ChannelVerification>
  channelVerificationsConnection: ChannelVerificationsConnection
  channelSuspensions: Array<ChannelSuspension>
  channelSuspensionById?: Maybe<ChannelSuspension>
  /** @deprecated Use channelSuspensionById */
  channelSuspensionByUniqueInput?: Maybe<ChannelSuspension>
  channelSuspensionsConnection: ChannelSuspensionsConnection
  apps: Array<App>
  appById?: Maybe<App>
  /** @deprecated Use appById */
  appByUniqueInput?: Maybe<App>
  appsConnection: AppsConnection
  curatorGroups: Array<CuratorGroup>
  curatorGroupById?: Maybe<CuratorGroup>
  /** @deprecated Use curatorGroupById */
  curatorGroupByUniqueInput?: Maybe<CuratorGroup>
  curatorGroupsConnection: CuratorGroupsConnection
  curators: Array<Curator>
  curatorById?: Maybe<Curator>
  /** @deprecated Use curatorById */
  curatorByUniqueInput?: Maybe<Curator>
  curatorsConnection: CuratorsConnection
  memberMetadata: Array<MemberMetadata>
  memberMetadataById?: Maybe<MemberMetadata>
  /** @deprecated Use memberMetadataById */
  memberMetadataByUniqueInput?: Maybe<MemberMetadata>
  memberMetadataConnection: MemberMetadataConnection
  memberships: Array<Membership>
  membershipById?: Maybe<Membership>
  /** @deprecated Use membershipById */
  membershipByUniqueInput?: Maybe<Membership>
  membershipsConnection: MembershipsConnection
  ownedNfts: Array<OwnedNft>
  ownedNftById?: Maybe<OwnedNft>
  /** @deprecated Use ownedNftById */
  ownedNftByUniqueInput?: Maybe<OwnedNft>
  ownedNftsConnection: OwnedNftsConnection
  auctions: Array<Auction>
  auctionById?: Maybe<Auction>
  /** @deprecated Use auctionById */
  auctionByUniqueInput?: Maybe<Auction>
  auctionsConnection: AuctionsConnection
  auctionWhitelistedMembers: Array<AuctionWhitelistedMember>
  auctionWhitelistedMemberById?: Maybe<AuctionWhitelistedMember>
  /** @deprecated Use auctionWhitelistedMemberById */
  auctionWhitelistedMemberByUniqueInput?: Maybe<AuctionWhitelistedMember>
  auctionWhitelistedMembersConnection: AuctionWhitelistedMembersConnection
  bids: Array<Bid>
  bidById?: Maybe<Bid>
  /** @deprecated Use bidById */
  bidByUniqueInput?: Maybe<Bid>
  bidsConnection: BidsConnection
  commentReactions: Array<CommentReaction>
  commentReactionById?: Maybe<CommentReaction>
  /** @deprecated Use commentReactionById */
  commentReactionByUniqueInput?: Maybe<CommentReaction>
  commentReactionsConnection: CommentReactionsConnection
  comments: Array<Comment>
  commentById?: Maybe<Comment>
  /** @deprecated Use commentById */
  commentByUniqueInput?: Maybe<Comment>
  commentsConnection: CommentsConnection
  squidStatus?: Maybe<SquidStatus>
}

export type QueryExtendedChannelsArgs = {
  where?: Maybe<ExtendedChannelWhereInput>
  orderBy?: Maybe<Array<ChannelOrderByInput>>
  limit?: Maybe<Scalars['Int']>
}

export type QueryMostRecentChannelsArgs = {
  where?: Maybe<ExtendedChannelWhereInput>
  orderBy?: Maybe<Array<ChannelOrderByInput>>
  mostRecentLimit: Scalars['Int']
  resultsLimit?: Maybe<Scalars['Int']>
}

export type QueryTopSellingChannelsArgs = {
  where?: Maybe<ExtendedChannelWhereInput>
  limit: Scalars['Int']
  periodDays: Scalars['Int']
}

export type QueryChannelNftCollectorsArgs = {
  channelId: Scalars['String']
  orderBy?: Maybe<ChannelNftCollectorsOrderByInput>
  limit?: Maybe<Scalars['Int']>
}

export type QueryMostViewedVideosConnectionArgs = {
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  orderBy: Array<VideoOrderByInput>
  where?: Maybe<VideoWhereInput>
  periodDays?: Maybe<Scalars['Int']>
  limit: Scalars['Int']
}

export type QueryDumbPublicFeedVideosArgs = {
  where?: Maybe<VideoWhereInput>
  skipVideoIds?: Maybe<Array<Scalars['String']>>
  limit?: Maybe<Scalars['Int']>
}

export type QueryEndingAuctionsNftsArgs = {
  where?: Maybe<OwnedNftWhereInput>
  limit?: Maybe<Scalars['Int']>
  offset?: Maybe<Scalars['Int']>
}

export type QueryUsersArgs = {
  where?: Maybe<UserWhereInput>
  orderBy?: Maybe<Array<UserOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryUserByIdArgs = {
  id: Scalars['String']
}

export type QueryUserByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryUsersConnectionArgs = {
  orderBy: Array<UserOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<UserWhereInput>
}

export type QueryEncryptionArtifactsArgs = {
  where?: Maybe<EncryptionArtifactsWhereInput>
  orderBy?: Maybe<Array<EncryptionArtifactsOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryEncryptionArtifactsByIdArgs = {
  id: Scalars['String']
}

export type QueryEncryptionArtifactsByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryEncryptionArtifactsConnectionArgs = {
  orderBy: Array<EncryptionArtifactsOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<EncryptionArtifactsWhereInput>
}

export type QuerySessionEncryptionArtifactsArgs = {
  where?: Maybe<SessionEncryptionArtifactsWhereInput>
  orderBy?: Maybe<Array<SessionEncryptionArtifactsOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QuerySessionEncryptionArtifactsByIdArgs = {
  id: Scalars['String']
}

export type QuerySessionEncryptionArtifactsByUniqueInputArgs = {
  where: WhereIdInput
}

export type QuerySessionEncryptionArtifactsConnectionArgs = {
  orderBy: Array<SessionEncryptionArtifactsOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<SessionEncryptionArtifactsWhereInput>
}

export type QuerySessionsArgs = {
  where?: Maybe<SessionWhereInput>
  orderBy?: Maybe<Array<SessionOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QuerySessionByIdArgs = {
  id: Scalars['String']
}

export type QuerySessionByUniqueInputArgs = {
  where: WhereIdInput
}

export type QuerySessionsConnectionArgs = {
  orderBy: Array<SessionOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<SessionWhereInput>
}

export type QueryAccountsArgs = {
  where?: Maybe<AccountWhereInput>
  orderBy?: Maybe<Array<AccountOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryAccountByIdArgs = {
  id: Scalars['String']
}

export type QueryAccountByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryAccountsConnectionArgs = {
  orderBy: Array<AccountOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<AccountWhereInput>
}

export type QueryTokensArgs = {
  where?: Maybe<TokenWhereInput>
  orderBy?: Maybe<Array<TokenOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryTokenByIdArgs = {
  id: Scalars['String']
}

export type QueryTokenByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryTokensConnectionArgs = {
  orderBy: Array<TokenOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<TokenWhereInput>
}

export type QueryEventsArgs = {
  where?: Maybe<EventWhereInput>
  orderBy?: Maybe<Array<EventOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryEventByIdArgs = {
  id: Scalars['String']
}

export type QueryEventByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryEventsConnectionArgs = {
  orderBy: Array<EventOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<EventWhereInput>
}

export type QueryNftHistoryEntriesArgs = {
  where?: Maybe<NftHistoryEntryWhereInput>
  orderBy?: Maybe<Array<NftHistoryEntryOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryNftHistoryEntryByIdArgs = {
  id: Scalars['String']
}

export type QueryNftHistoryEntryByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryNftHistoryEntriesConnectionArgs = {
  orderBy: Array<NftHistoryEntryOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<NftHistoryEntryWhereInput>
}

export type QueryNftActivitiesArgs = {
  where?: Maybe<NftActivityWhereInput>
  orderBy?: Maybe<Array<NftActivityOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryNftActivityByIdArgs = {
  id: Scalars['String']
}

export type QueryNftActivityByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryNftActivitiesConnectionArgs = {
  orderBy: Array<NftActivityOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<NftActivityWhereInput>
}

export type QueryNotificationEmailDeliveriesArgs = {
  where?: Maybe<NotificationEmailDeliveryWhereInput>
  orderBy?: Maybe<Array<NotificationEmailDeliveryOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryNotificationEmailDeliveryByIdArgs = {
  id: Scalars['String']
}

export type QueryNotificationEmailDeliveryByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryNotificationEmailDeliveriesConnectionArgs = {
  orderBy: Array<NotificationEmailDeliveryOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<NotificationEmailDeliveryWhereInput>
}

export type QueryEmailDeliveryAttemptsArgs = {
  where?: Maybe<EmailDeliveryAttemptWhereInput>
  orderBy?: Maybe<Array<EmailDeliveryAttemptOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryEmailDeliveryAttemptByIdArgs = {
  id: Scalars['String']
}

export type QueryEmailDeliveryAttemptByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryEmailDeliveryAttemptsConnectionArgs = {
  orderBy: Array<EmailDeliveryAttemptOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<EmailDeliveryAttemptWhereInput>
}

export type QueryNotificationsArgs = {
  where?: Maybe<NotificationWhereInput>
  orderBy?: Maybe<Array<NotificationOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryNotificationByIdArgs = {
  id: Scalars['String']
}

export type QueryNotificationByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryNotificationsConnectionArgs = {
  orderBy: Array<NotificationOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<NotificationWhereInput>
}

export type QueryVideoCategoriesArgs = {
  where?: Maybe<VideoCategoryWhereInput>
  orderBy?: Maybe<Array<VideoCategoryOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryVideoCategoryByIdArgs = {
  id: Scalars['String']
}

export type QueryVideoCategoryByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryVideoCategoriesConnectionArgs = {
  orderBy: Array<VideoCategoryOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<VideoCategoryWhereInput>
}

export type QueryVideosArgs = {
  where?: Maybe<VideoWhereInput>
  orderBy?: Maybe<Array<VideoOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryVideoByIdArgs = {
  id: Scalars['String']
}

export type QueryVideoByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryVideosConnectionArgs = {
  orderBy: Array<VideoOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<VideoWhereInput>
}

export type QueryVideoFeaturedInCategoriesArgs = {
  where?: Maybe<VideoFeaturedInCategoryWhereInput>
  orderBy?: Maybe<Array<VideoFeaturedInCategoryOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryVideoFeaturedInCategoryByIdArgs = {
  id: Scalars['String']
}

export type QueryVideoFeaturedInCategoryByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryVideoFeaturedInCategoriesConnectionArgs = {
  orderBy: Array<VideoFeaturedInCategoryOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<VideoFeaturedInCategoryWhereInput>
}

export type QueryVideoHerosArgs = {
  where?: Maybe<VideoHeroWhereInput>
  orderBy?: Maybe<Array<VideoHeroOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryVideoHeroByIdArgs = {
  id: Scalars['String']
}

export type QueryVideoHeroByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryVideoHerosConnectionArgs = {
  orderBy: Array<VideoHeroOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<VideoHeroWhereInput>
}

export type QueryVideoMediaMetadataArgs = {
  where?: Maybe<VideoMediaMetadataWhereInput>
  orderBy?: Maybe<Array<VideoMediaMetadataOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryVideoMediaMetadataByIdArgs = {
  id: Scalars['String']
}

export type QueryVideoMediaMetadataByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryVideoMediaMetadataConnectionArgs = {
  orderBy: Array<VideoMediaMetadataOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<VideoMediaMetadataWhereInput>
}

export type QueryVideoMediaEncodingsArgs = {
  where?: Maybe<VideoMediaEncodingWhereInput>
  orderBy?: Maybe<Array<VideoMediaEncodingOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryVideoMediaEncodingByIdArgs = {
  id: Scalars['String']
}

export type QueryVideoMediaEncodingByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryVideoMediaEncodingsConnectionArgs = {
  orderBy: Array<VideoMediaEncodingOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<VideoMediaEncodingWhereInput>
}

export type QueryLicensesArgs = {
  where?: Maybe<LicenseWhereInput>
  orderBy?: Maybe<Array<LicenseOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryLicenseByIdArgs = {
  id: Scalars['String']
}

export type QueryLicenseByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryLicensesConnectionArgs = {
  orderBy: Array<LicenseOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<LicenseWhereInput>
}

export type QueryVideoSubtitlesArgs = {
  where?: Maybe<VideoSubtitleWhereInput>
  orderBy?: Maybe<Array<VideoSubtitleOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryVideoSubtitleByIdArgs = {
  id: Scalars['String']
}

export type QueryVideoSubtitleByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryVideoSubtitlesConnectionArgs = {
  orderBy: Array<VideoSubtitleOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<VideoSubtitleWhereInput>
}

export type QueryVideoReactionsArgs = {
  where?: Maybe<VideoReactionWhereInput>
  orderBy?: Maybe<Array<VideoReactionOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryVideoReactionByIdArgs = {
  id: Scalars['String']
}

export type QueryVideoReactionByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryVideoReactionsConnectionArgs = {
  orderBy: Array<VideoReactionOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<VideoReactionWhereInput>
}

export type QueryVideoViewEventsArgs = {
  where?: Maybe<VideoViewEventWhereInput>
  orderBy?: Maybe<Array<VideoViewEventOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryVideoViewEventByIdArgs = {
  id: Scalars['String']
}

export type QueryVideoViewEventByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryVideoViewEventsConnectionArgs = {
  orderBy: Array<VideoViewEventOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<VideoViewEventWhereInput>
}

export type QueryReportsArgs = {
  where?: Maybe<ReportWhereInput>
  orderBy?: Maybe<Array<ReportOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryReportByIdArgs = {
  id: Scalars['String']
}

export type QueryReportByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryReportsConnectionArgs = {
  orderBy: Array<ReportOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<ReportWhereInput>
}

export type QueryNftFeaturingRequestsArgs = {
  where?: Maybe<NftFeaturingRequestWhereInput>
  orderBy?: Maybe<Array<NftFeaturingRequestOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryNftFeaturingRequestByIdArgs = {
  id: Scalars['String']
}

export type QueryNftFeaturingRequestByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryNftFeaturingRequestsConnectionArgs = {
  orderBy: Array<NftFeaturingRequestOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<NftFeaturingRequestWhereInput>
}

export type QueryChannelFollowsArgs = {
  where?: Maybe<ChannelFollowWhereInput>
  orderBy?: Maybe<Array<ChannelFollowOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryChannelFollowByIdArgs = {
  id: Scalars['String']
}

export type QueryChannelFollowByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryChannelFollowsConnectionArgs = {
  orderBy: Array<ChannelFollowOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<ChannelFollowWhereInput>
}

export type QueryGatewayConfigsArgs = {
  where?: Maybe<GatewayConfigWhereInput>
  orderBy?: Maybe<Array<GatewayConfigOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryGatewayConfigByIdArgs = {
  id: Scalars['String']
}

export type QueryGatewayConfigByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryGatewayConfigsConnectionArgs = {
  orderBy: Array<GatewayConfigOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<GatewayConfigWhereInput>
}

export type QueryExclusionsArgs = {
  where?: Maybe<ExclusionWhereInput>
  orderBy?: Maybe<Array<ExclusionOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryExclusionByIdArgs = {
  id: Scalars['String']
}

export type QueryExclusionByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryExclusionsConnectionArgs = {
  orderBy: Array<ExclusionOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<ExclusionWhereInput>
}

export type QueryStorageBucketOperatorMetadataArgs = {
  where?: Maybe<StorageBucketOperatorMetadataWhereInput>
  orderBy?: Maybe<Array<StorageBucketOperatorMetadataOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryStorageBucketOperatorMetadataByIdArgs = {
  id: Scalars['String']
}

export type QueryStorageBucketOperatorMetadataByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryStorageBucketOperatorMetadataConnectionArgs = {
  orderBy: Array<StorageBucketOperatorMetadataOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<StorageBucketOperatorMetadataWhereInput>
}

export type QueryStorageBucketsArgs = {
  where?: Maybe<StorageBucketWhereInput>
  orderBy?: Maybe<Array<StorageBucketOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryStorageBucketByIdArgs = {
  id: Scalars['String']
}

export type QueryStorageBucketByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryStorageBucketsConnectionArgs = {
  orderBy: Array<StorageBucketOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<StorageBucketWhereInput>
}

export type QueryStorageBagsArgs = {
  where?: Maybe<StorageBagWhereInput>
  orderBy?: Maybe<Array<StorageBagOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryStorageBagByIdArgs = {
  id: Scalars['String']
}

export type QueryStorageBagByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryStorageBagsConnectionArgs = {
  orderBy: Array<StorageBagOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<StorageBagWhereInput>
}

export type QueryStorageBucketBagsArgs = {
  where?: Maybe<StorageBucketBagWhereInput>
  orderBy?: Maybe<Array<StorageBucketBagOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryStorageBucketBagByIdArgs = {
  id: Scalars['String']
}

export type QueryStorageBucketBagByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryStorageBucketBagsConnectionArgs = {
  orderBy: Array<StorageBucketBagOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<StorageBucketBagWhereInput>
}

export type QueryDistributionBucketBagsArgs = {
  where?: Maybe<DistributionBucketBagWhereInput>
  orderBy?: Maybe<Array<DistributionBucketBagOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryDistributionBucketBagByIdArgs = {
  id: Scalars['String']
}

export type QueryDistributionBucketBagByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryDistributionBucketBagsConnectionArgs = {
  orderBy: Array<DistributionBucketBagOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<DistributionBucketBagWhereInput>
}

export type QueryStorageDataObjectsArgs = {
  where?: Maybe<StorageDataObjectWhereInput>
  orderBy?: Maybe<Array<StorageDataObjectOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryStorageDataObjectByIdArgs = {
  id: Scalars['String']
}

export type QueryStorageDataObjectByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryStorageDataObjectsConnectionArgs = {
  orderBy: Array<StorageDataObjectOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<StorageDataObjectWhereInput>
}

export type QueryDistributionBucketFamilyMetadataArgs = {
  where?: Maybe<DistributionBucketFamilyMetadataWhereInput>
  orderBy?: Maybe<Array<DistributionBucketFamilyMetadataOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryDistributionBucketFamilyMetadataByIdArgs = {
  id: Scalars['String']
}

export type QueryDistributionBucketFamilyMetadataByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryDistributionBucketFamilyMetadataConnectionArgs = {
  orderBy: Array<DistributionBucketFamilyMetadataOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<DistributionBucketFamilyMetadataWhereInput>
}

export type QueryDistributionBucketOperatorMetadataArgs = {
  where?: Maybe<DistributionBucketOperatorMetadataWhereInput>
  orderBy?: Maybe<Array<DistributionBucketOperatorMetadataOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryDistributionBucketOperatorMetadataByIdArgs = {
  id: Scalars['String']
}

export type QueryDistributionBucketOperatorMetadataByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryDistributionBucketOperatorMetadataConnectionArgs = {
  orderBy: Array<DistributionBucketOperatorMetadataOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<DistributionBucketOperatorMetadataWhereInput>
}

export type QueryDistributionBucketOperatorsArgs = {
  where?: Maybe<DistributionBucketOperatorWhereInput>
  orderBy?: Maybe<Array<DistributionBucketOperatorOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryDistributionBucketOperatorByIdArgs = {
  id: Scalars['String']
}

export type QueryDistributionBucketOperatorByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryDistributionBucketOperatorsConnectionArgs = {
  orderBy: Array<DistributionBucketOperatorOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<DistributionBucketOperatorWhereInput>
}

export type QueryDistributionBucketsArgs = {
  where?: Maybe<DistributionBucketWhereInput>
  orderBy?: Maybe<Array<DistributionBucketOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryDistributionBucketByIdArgs = {
  id: Scalars['String']
}

export type QueryDistributionBucketByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryDistributionBucketsConnectionArgs = {
  orderBy: Array<DistributionBucketOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<DistributionBucketWhereInput>
}

export type QueryDistributionBucketFamiliesArgs = {
  where?: Maybe<DistributionBucketFamilyWhereInput>
  orderBy?: Maybe<Array<DistributionBucketFamilyOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryDistributionBucketFamilyByIdArgs = {
  id: Scalars['String']
}

export type QueryDistributionBucketFamilyByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryDistributionBucketFamiliesConnectionArgs = {
  orderBy: Array<DistributionBucketFamilyOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<DistributionBucketFamilyWhereInput>
}

export type QueryChannelsArgs = {
  where?: Maybe<ChannelWhereInput>
  orderBy?: Maybe<Array<ChannelOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryChannelByIdArgs = {
  id: Scalars['String']
}

export type QueryChannelByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryChannelsConnectionArgs = {
  orderBy: Array<ChannelOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<ChannelWhereInput>
}

export type QueryBannedMembersArgs = {
  where?: Maybe<BannedMemberWhereInput>
  orderBy?: Maybe<Array<BannedMemberOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryBannedMemberByIdArgs = {
  id: Scalars['String']
}

export type QueryBannedMemberByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryBannedMembersConnectionArgs = {
  orderBy: Array<BannedMemberOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<BannedMemberWhereInput>
}

export type QueryChannelVerificationsArgs = {
  where?: Maybe<ChannelVerificationWhereInput>
  orderBy?: Maybe<Array<ChannelVerificationOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryChannelVerificationByIdArgs = {
  id: Scalars['String']
}

export type QueryChannelVerificationByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryChannelVerificationsConnectionArgs = {
  orderBy: Array<ChannelVerificationOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<ChannelVerificationWhereInput>
}

export type QueryChannelSuspensionsArgs = {
  where?: Maybe<ChannelSuspensionWhereInput>
  orderBy?: Maybe<Array<ChannelSuspensionOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryChannelSuspensionByIdArgs = {
  id: Scalars['String']
}

export type QueryChannelSuspensionByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryChannelSuspensionsConnectionArgs = {
  orderBy: Array<ChannelSuspensionOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<ChannelSuspensionWhereInput>
}

export type QueryAppsArgs = {
  where?: Maybe<AppWhereInput>
  orderBy?: Maybe<Array<AppOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryAppByIdArgs = {
  id: Scalars['String']
}

export type QueryAppByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryAppsConnectionArgs = {
  orderBy: Array<AppOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<AppWhereInput>
}

export type QueryCuratorGroupsArgs = {
  where?: Maybe<CuratorGroupWhereInput>
  orderBy?: Maybe<Array<CuratorGroupOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryCuratorGroupByIdArgs = {
  id: Scalars['String']
}

export type QueryCuratorGroupByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryCuratorGroupsConnectionArgs = {
  orderBy: Array<CuratorGroupOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<CuratorGroupWhereInput>
}

export type QueryCuratorsArgs = {
  where?: Maybe<CuratorWhereInput>
  orderBy?: Maybe<Array<CuratorOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryCuratorByIdArgs = {
  id: Scalars['String']
}

export type QueryCuratorByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryCuratorsConnectionArgs = {
  orderBy: Array<CuratorOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<CuratorWhereInput>
}

export type QueryMemberMetadataArgs = {
  where?: Maybe<MemberMetadataWhereInput>
  orderBy?: Maybe<Array<MemberMetadataOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryMemberMetadataByIdArgs = {
  id: Scalars['String']
}

export type QueryMemberMetadataByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryMemberMetadataConnectionArgs = {
  orderBy: Array<MemberMetadataOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<MemberMetadataWhereInput>
}

export type QueryMembershipsArgs = {
  where?: Maybe<MembershipWhereInput>
  orderBy?: Maybe<Array<MembershipOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryMembershipByIdArgs = {
  id: Scalars['String']
}

export type QueryMembershipByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryMembershipsConnectionArgs = {
  orderBy: Array<MembershipOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<MembershipWhereInput>
}

export type QueryOwnedNftsArgs = {
  where?: Maybe<OwnedNftWhereInput>
  orderBy?: Maybe<Array<OwnedNftOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryOwnedNftByIdArgs = {
  id: Scalars['String']
}

export type QueryOwnedNftByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryOwnedNftsConnectionArgs = {
  orderBy: Array<OwnedNftOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<OwnedNftWhereInput>
}

export type QueryAuctionsArgs = {
  where?: Maybe<AuctionWhereInput>
  orderBy?: Maybe<Array<AuctionOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryAuctionByIdArgs = {
  id: Scalars['String']
}

export type QueryAuctionByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryAuctionsConnectionArgs = {
  orderBy: Array<AuctionOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<AuctionWhereInput>
}

export type QueryAuctionWhitelistedMembersArgs = {
  where?: Maybe<AuctionWhitelistedMemberWhereInput>
  orderBy?: Maybe<Array<AuctionWhitelistedMemberOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryAuctionWhitelistedMemberByIdArgs = {
  id: Scalars['String']
}

export type QueryAuctionWhitelistedMemberByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryAuctionWhitelistedMembersConnectionArgs = {
  orderBy: Array<AuctionWhitelistedMemberOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<AuctionWhitelistedMemberWhereInput>
}

export type QueryBidsArgs = {
  where?: Maybe<BidWhereInput>
  orderBy?: Maybe<Array<BidOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryBidByIdArgs = {
  id: Scalars['String']
}

export type QueryBidByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryBidsConnectionArgs = {
  orderBy: Array<BidOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<BidWhereInput>
}

export type QueryCommentReactionsArgs = {
  where?: Maybe<CommentReactionWhereInput>
  orderBy?: Maybe<Array<CommentReactionOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryCommentReactionByIdArgs = {
  id: Scalars['String']
}

export type QueryCommentReactionByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryCommentReactionsConnectionArgs = {
  orderBy: Array<CommentReactionOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<CommentReactionWhereInput>
}

export type QueryCommentsArgs = {
  where?: Maybe<CommentWhereInput>
  orderBy?: Maybe<Array<CommentOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type QueryCommentByIdArgs = {
  id: Scalars['String']
}

export type QueryCommentByUniqueInputArgs = {
  where: WhereIdInput
}

export type QueryCommentsConnectionArgs = {
  orderBy: Array<CommentOrderByInput>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  where?: Maybe<CommentWhereInput>
}

export type ReactionToComment = {
  /** commentId for link */
  commentId: Scalars['String']
  /** video Id used for link */
  videoId: Scalars['String']
  /** video title for notification text */
  videoTitle: Scalars['String']
  /** member who replied */
  memberId: Scalars['String']
  /** member who replied */
  memberHandle: Scalars['String']
}

export type Read = {
  /** timestamp */
  readAt: Scalars['DateTime']
}

export type ReadOrUnread = Read | Unread

export type ReadOrUnreadWhereInput = {
  readAt_isNull?: Maybe<Scalars['Boolean']>
  readAt_eq?: Maybe<Scalars['DateTime']>
  readAt_not_eq?: Maybe<Scalars['DateTime']>
  readAt_gt?: Maybe<Scalars['DateTime']>
  readAt_gte?: Maybe<Scalars['DateTime']>
  readAt_lt?: Maybe<Scalars['DateTime']>
  readAt_lte?: Maybe<Scalars['DateTime']>
  readAt_in?: Maybe<Array<Scalars['DateTime']>>
  readAt_not_in?: Maybe<Array<Scalars['DateTime']>>
  phantom_isNull?: Maybe<Scalars['Boolean']>
  phantom_eq?: Maybe<Scalars['Int']>
  phantom_not_eq?: Maybe<Scalars['Int']>
  phantom_gt?: Maybe<Scalars['Int']>
  phantom_gte?: Maybe<Scalars['Int']>
  phantom_lt?: Maybe<Scalars['Int']>
  phantom_lte?: Maybe<Scalars['Int']>
  phantom_in?: Maybe<Array<Scalars['Int']>>
  phantom_not_in?: Maybe<Array<Scalars['Int']>>
  isTypeOf_isNull?: Maybe<Scalars['Boolean']>
  isTypeOf_eq?: Maybe<Scalars['String']>
  isTypeOf_not_eq?: Maybe<Scalars['String']>
  isTypeOf_gt?: Maybe<Scalars['String']>
  isTypeOf_gte?: Maybe<Scalars['String']>
  isTypeOf_lt?: Maybe<Scalars['String']>
  isTypeOf_lte?: Maybe<Scalars['String']>
  isTypeOf_in?: Maybe<Array<Scalars['String']>>
  isTypeOf_not_in?: Maybe<Array<Scalars['String']>>
  isTypeOf_contains?: Maybe<Scalars['String']>
  isTypeOf_not_contains?: Maybe<Scalars['String']>
  isTypeOf_containsInsensitive?: Maybe<Scalars['String']>
  isTypeOf_not_containsInsensitive?: Maybe<Scalars['String']>
  isTypeOf_startsWith?: Maybe<Scalars['String']>
  isTypeOf_not_startsWith?: Maybe<Scalars['String']>
  isTypeOf_endsWith?: Maybe<Scalars['String']>
  isTypeOf_not_endsWith?: Maybe<Scalars['String']>
}

export type RecipientType = MemberRecipient | ChannelRecipient

export type RecipientTypeWhereInput = {
  membership_isNull?: Maybe<Scalars['Boolean']>
  membership?: Maybe<MembershipWhereInput>
  channel_isNull?: Maybe<Scalars['Boolean']>
  channel?: Maybe<ChannelWhereInput>
  isTypeOf_isNull?: Maybe<Scalars['Boolean']>
  isTypeOf_eq?: Maybe<Scalars['String']>
  isTypeOf_not_eq?: Maybe<Scalars['String']>
  isTypeOf_gt?: Maybe<Scalars['String']>
  isTypeOf_gte?: Maybe<Scalars['String']>
  isTypeOf_lt?: Maybe<Scalars['String']>
  isTypeOf_lte?: Maybe<Scalars['String']>
  isTypeOf_in?: Maybe<Array<Scalars['String']>>
  isTypeOf_not_in?: Maybe<Array<Scalars['String']>>
  isTypeOf_contains?: Maybe<Scalars['String']>
  isTypeOf_not_contains?: Maybe<Scalars['String']>
  isTypeOf_containsInsensitive?: Maybe<Scalars['String']>
  isTypeOf_not_containsInsensitive?: Maybe<Scalars['String']>
  isTypeOf_startsWith?: Maybe<Scalars['String']>
  isTypeOf_not_startsWith?: Maybe<Scalars['String']>
  isTypeOf_endsWith?: Maybe<Scalars['String']>
  isTypeOf_not_endsWith?: Maybe<Scalars['String']>
}

export type Report = {
  /** Unique identifier of the report */
  id: Scalars['String']
  /** User that reported the channel / video */
  user: User
  /** If it's a channel report: ID of the channel being reported (the channel may no longer exist) */
  channelId?: Maybe<Scalars['String']>
  /** If it's a video report: ID of the video being reported (the video may no longer exist) */
  videoId?: Maybe<Scalars['String']>
  /** Time of the report */
  timestamp: Scalars['DateTime']
  /** Rationale behind the report */
  rationale: Scalars['String']
}

export type ReportEdge = {
  node: Report
  cursor: Scalars['String']
}

export enum ReportOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  UserIdAsc = 'user_id_ASC',
  UserIdDesc = 'user_id_DESC',
  UserIsRootAsc = 'user_isRoot_ASC',
  UserIsRootDesc = 'user_isRoot_DESC',
  ChannelIdAsc = 'channelId_ASC',
  ChannelIdDesc = 'channelId_DESC',
  VideoIdAsc = 'videoId_ASC',
  VideoIdDesc = 'videoId_DESC',
  TimestampAsc = 'timestamp_ASC',
  TimestampDesc = 'timestamp_DESC',
  RationaleAsc = 'rationale_ASC',
  RationaleDesc = 'rationale_DESC',
}

export type ReportWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  user_isNull?: Maybe<Scalars['Boolean']>
  user?: Maybe<UserWhereInput>
  channelId_isNull?: Maybe<Scalars['Boolean']>
  channelId_eq?: Maybe<Scalars['String']>
  channelId_not_eq?: Maybe<Scalars['String']>
  channelId_gt?: Maybe<Scalars['String']>
  channelId_gte?: Maybe<Scalars['String']>
  channelId_lt?: Maybe<Scalars['String']>
  channelId_lte?: Maybe<Scalars['String']>
  channelId_in?: Maybe<Array<Scalars['String']>>
  channelId_not_in?: Maybe<Array<Scalars['String']>>
  channelId_contains?: Maybe<Scalars['String']>
  channelId_not_contains?: Maybe<Scalars['String']>
  channelId_containsInsensitive?: Maybe<Scalars['String']>
  channelId_not_containsInsensitive?: Maybe<Scalars['String']>
  channelId_startsWith?: Maybe<Scalars['String']>
  channelId_not_startsWith?: Maybe<Scalars['String']>
  channelId_endsWith?: Maybe<Scalars['String']>
  channelId_not_endsWith?: Maybe<Scalars['String']>
  videoId_isNull?: Maybe<Scalars['Boolean']>
  videoId_eq?: Maybe<Scalars['String']>
  videoId_not_eq?: Maybe<Scalars['String']>
  videoId_gt?: Maybe<Scalars['String']>
  videoId_gte?: Maybe<Scalars['String']>
  videoId_lt?: Maybe<Scalars['String']>
  videoId_lte?: Maybe<Scalars['String']>
  videoId_in?: Maybe<Array<Scalars['String']>>
  videoId_not_in?: Maybe<Array<Scalars['String']>>
  videoId_contains?: Maybe<Scalars['String']>
  videoId_not_contains?: Maybe<Scalars['String']>
  videoId_containsInsensitive?: Maybe<Scalars['String']>
  videoId_not_containsInsensitive?: Maybe<Scalars['String']>
  videoId_startsWith?: Maybe<Scalars['String']>
  videoId_not_startsWith?: Maybe<Scalars['String']>
  videoId_endsWith?: Maybe<Scalars['String']>
  videoId_not_endsWith?: Maybe<Scalars['String']>
  timestamp_isNull?: Maybe<Scalars['Boolean']>
  timestamp_eq?: Maybe<Scalars['DateTime']>
  timestamp_not_eq?: Maybe<Scalars['DateTime']>
  timestamp_gt?: Maybe<Scalars['DateTime']>
  timestamp_gte?: Maybe<Scalars['DateTime']>
  timestamp_lt?: Maybe<Scalars['DateTime']>
  timestamp_lte?: Maybe<Scalars['DateTime']>
  timestamp_in?: Maybe<Array<Scalars['DateTime']>>
  timestamp_not_in?: Maybe<Array<Scalars['DateTime']>>
  rationale_isNull?: Maybe<Scalars['Boolean']>
  rationale_eq?: Maybe<Scalars['String']>
  rationale_not_eq?: Maybe<Scalars['String']>
  rationale_gt?: Maybe<Scalars['String']>
  rationale_gte?: Maybe<Scalars['String']>
  rationale_lt?: Maybe<Scalars['String']>
  rationale_lte?: Maybe<Scalars['String']>
  rationale_in?: Maybe<Array<Scalars['String']>>
  rationale_not_in?: Maybe<Array<Scalars['String']>>
  rationale_contains?: Maybe<Scalars['String']>
  rationale_not_contains?: Maybe<Scalars['String']>
  rationale_containsInsensitive?: Maybe<Scalars['String']>
  rationale_not_containsInsensitive?: Maybe<Scalars['String']>
  rationale_startsWith?: Maybe<Scalars['String']>
  rationale_not_startsWith?: Maybe<Scalars['String']>
  rationale_endsWith?: Maybe<Scalars['String']>
  rationale_not_endsWith?: Maybe<Scalars['String']>
  AND?: Maybe<Array<ReportWhereInput>>
  OR?: Maybe<Array<ReportWhereInput>>
}

export type ReportsConnection = {
  edges: Array<ReportEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type RestoreContentResult = {
  numberOfEntitiesAffected: Scalars['Int']
}

export type Session = {
  /** Unique identifier (32-byte string, securely random) */
  id: Scalars['String']
  /** Browser (as deterimned based on user-agent header) */
  browser: Scalars['String']
  /** Operating system (as deterimned based on user-agent header) */
  os: Scalars['String']
  /** Device (as deterimned based on user-agent header) */
  device: Scalars['String']
  /** Device type (as deterimned based on user-agent header) */
  deviceType?: Maybe<Scalars['String']>
  /** User associated with the session */
  user: User
  /** Account associated with the session (if any) */
  account?: Maybe<Account>
  /** IP address associated with the session */
  ip: Scalars['String']
  /** Time when the session started */
  startedAt: Scalars['DateTime']
  /** Time when the session expires or did expire */
  expiry: Scalars['DateTime']
}

export type SessionEdge = {
  node: Session
  cursor: Scalars['String']
}

export type SessionEncryptionArtifacts = {
  /** Unique identifier */
  id: Scalars['String']
  /** The session the encryption artifacts are associated with */
  session: Session
  /** The IV used to encrypt the seed with cipherKey */
  cipherIv: Scalars['String']
  /** cipherKey used to encrypt the seed stored client-side for the duration of the session */
  cipherKey: Scalars['String']
}

export type SessionEncryptionArtifactsConnection = {
  edges: Array<SessionEncryptionArtifactsEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type SessionEncryptionArtifactsEdge = {
  node: SessionEncryptionArtifacts
  cursor: Scalars['String']
}

export enum SessionEncryptionArtifactsOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  SessionIdAsc = 'session_id_ASC',
  SessionIdDesc = 'session_id_DESC',
  SessionBrowserAsc = 'session_browser_ASC',
  SessionBrowserDesc = 'session_browser_DESC',
  SessionOsAsc = 'session_os_ASC',
  SessionOsDesc = 'session_os_DESC',
  SessionDeviceAsc = 'session_device_ASC',
  SessionDeviceDesc = 'session_device_DESC',
  SessionDeviceTypeAsc = 'session_deviceType_ASC',
  SessionDeviceTypeDesc = 'session_deviceType_DESC',
  SessionIpAsc = 'session_ip_ASC',
  SessionIpDesc = 'session_ip_DESC',
  SessionStartedAtAsc = 'session_startedAt_ASC',
  SessionStartedAtDesc = 'session_startedAt_DESC',
  SessionExpiryAsc = 'session_expiry_ASC',
  SessionExpiryDesc = 'session_expiry_DESC',
  CipherIvAsc = 'cipherIv_ASC',
  CipherIvDesc = 'cipherIv_DESC',
  CipherKeyAsc = 'cipherKey_ASC',
  CipherKeyDesc = 'cipherKey_DESC',
}

export type SessionEncryptionArtifactsWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  session_isNull?: Maybe<Scalars['Boolean']>
  session?: Maybe<SessionWhereInput>
  cipherIv_isNull?: Maybe<Scalars['Boolean']>
  cipherIv_eq?: Maybe<Scalars['String']>
  cipherIv_not_eq?: Maybe<Scalars['String']>
  cipherIv_gt?: Maybe<Scalars['String']>
  cipherIv_gte?: Maybe<Scalars['String']>
  cipherIv_lt?: Maybe<Scalars['String']>
  cipherIv_lte?: Maybe<Scalars['String']>
  cipherIv_in?: Maybe<Array<Scalars['String']>>
  cipherIv_not_in?: Maybe<Array<Scalars['String']>>
  cipherIv_contains?: Maybe<Scalars['String']>
  cipherIv_not_contains?: Maybe<Scalars['String']>
  cipherIv_containsInsensitive?: Maybe<Scalars['String']>
  cipherIv_not_containsInsensitive?: Maybe<Scalars['String']>
  cipherIv_startsWith?: Maybe<Scalars['String']>
  cipherIv_not_startsWith?: Maybe<Scalars['String']>
  cipherIv_endsWith?: Maybe<Scalars['String']>
  cipherIv_not_endsWith?: Maybe<Scalars['String']>
  cipherKey_isNull?: Maybe<Scalars['Boolean']>
  cipherKey_eq?: Maybe<Scalars['String']>
  cipherKey_not_eq?: Maybe<Scalars['String']>
  cipherKey_gt?: Maybe<Scalars['String']>
  cipherKey_gte?: Maybe<Scalars['String']>
  cipherKey_lt?: Maybe<Scalars['String']>
  cipherKey_lte?: Maybe<Scalars['String']>
  cipherKey_in?: Maybe<Array<Scalars['String']>>
  cipherKey_not_in?: Maybe<Array<Scalars['String']>>
  cipherKey_contains?: Maybe<Scalars['String']>
  cipherKey_not_contains?: Maybe<Scalars['String']>
  cipherKey_containsInsensitive?: Maybe<Scalars['String']>
  cipherKey_not_containsInsensitive?: Maybe<Scalars['String']>
  cipherKey_startsWith?: Maybe<Scalars['String']>
  cipherKey_not_startsWith?: Maybe<Scalars['String']>
  cipherKey_endsWith?: Maybe<Scalars['String']>
  cipherKey_not_endsWith?: Maybe<Scalars['String']>
  AND?: Maybe<Array<SessionEncryptionArtifactsWhereInput>>
  OR?: Maybe<Array<SessionEncryptionArtifactsWhereInput>>
}

export enum SessionOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  BrowserAsc = 'browser_ASC',
  BrowserDesc = 'browser_DESC',
  OsAsc = 'os_ASC',
  OsDesc = 'os_DESC',
  DeviceAsc = 'device_ASC',
  DeviceDesc = 'device_DESC',
  DeviceTypeAsc = 'deviceType_ASC',
  DeviceTypeDesc = 'deviceType_DESC',
  UserIdAsc = 'user_id_ASC',
  UserIdDesc = 'user_id_DESC',
  UserIsRootAsc = 'user_isRoot_ASC',
  UserIsRootDesc = 'user_isRoot_DESC',
  AccountIdAsc = 'account_id_ASC',
  AccountIdDesc = 'account_id_DESC',
  AccountEmailAsc = 'account_email_ASC',
  AccountEmailDesc = 'account_email_DESC',
  AccountIsEmailConfirmedAsc = 'account_isEmailConfirmed_ASC',
  AccountIsEmailConfirmedDesc = 'account_isEmailConfirmed_DESC',
  AccountIsBlockedAsc = 'account_isBlocked_ASC',
  AccountIsBlockedDesc = 'account_isBlocked_DESC',
  AccountRegisteredAtAsc = 'account_registeredAt_ASC',
  AccountRegisteredAtDesc = 'account_registeredAt_DESC',
  AccountJoystreamAccountAsc = 'account_joystreamAccount_ASC',
  AccountJoystreamAccountDesc = 'account_joystreamAccount_DESC',
  AccountReferrerChannelIdAsc = 'account_referrerChannelId_ASC',
  AccountReferrerChannelIdDesc = 'account_referrerChannelId_DESC',
  IpAsc = 'ip_ASC',
  IpDesc = 'ip_DESC',
  StartedAtAsc = 'startedAt_ASC',
  StartedAtDesc = 'startedAt_DESC',
  ExpiryAsc = 'expiry_ASC',
  ExpiryDesc = 'expiry_DESC',
}

export type SessionWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  browser_isNull?: Maybe<Scalars['Boolean']>
  browser_eq?: Maybe<Scalars['String']>
  browser_not_eq?: Maybe<Scalars['String']>
  browser_gt?: Maybe<Scalars['String']>
  browser_gte?: Maybe<Scalars['String']>
  browser_lt?: Maybe<Scalars['String']>
  browser_lte?: Maybe<Scalars['String']>
  browser_in?: Maybe<Array<Scalars['String']>>
  browser_not_in?: Maybe<Array<Scalars['String']>>
  browser_contains?: Maybe<Scalars['String']>
  browser_not_contains?: Maybe<Scalars['String']>
  browser_containsInsensitive?: Maybe<Scalars['String']>
  browser_not_containsInsensitive?: Maybe<Scalars['String']>
  browser_startsWith?: Maybe<Scalars['String']>
  browser_not_startsWith?: Maybe<Scalars['String']>
  browser_endsWith?: Maybe<Scalars['String']>
  browser_not_endsWith?: Maybe<Scalars['String']>
  os_isNull?: Maybe<Scalars['Boolean']>
  os_eq?: Maybe<Scalars['String']>
  os_not_eq?: Maybe<Scalars['String']>
  os_gt?: Maybe<Scalars['String']>
  os_gte?: Maybe<Scalars['String']>
  os_lt?: Maybe<Scalars['String']>
  os_lte?: Maybe<Scalars['String']>
  os_in?: Maybe<Array<Scalars['String']>>
  os_not_in?: Maybe<Array<Scalars['String']>>
  os_contains?: Maybe<Scalars['String']>
  os_not_contains?: Maybe<Scalars['String']>
  os_containsInsensitive?: Maybe<Scalars['String']>
  os_not_containsInsensitive?: Maybe<Scalars['String']>
  os_startsWith?: Maybe<Scalars['String']>
  os_not_startsWith?: Maybe<Scalars['String']>
  os_endsWith?: Maybe<Scalars['String']>
  os_not_endsWith?: Maybe<Scalars['String']>
  device_isNull?: Maybe<Scalars['Boolean']>
  device_eq?: Maybe<Scalars['String']>
  device_not_eq?: Maybe<Scalars['String']>
  device_gt?: Maybe<Scalars['String']>
  device_gte?: Maybe<Scalars['String']>
  device_lt?: Maybe<Scalars['String']>
  device_lte?: Maybe<Scalars['String']>
  device_in?: Maybe<Array<Scalars['String']>>
  device_not_in?: Maybe<Array<Scalars['String']>>
  device_contains?: Maybe<Scalars['String']>
  device_not_contains?: Maybe<Scalars['String']>
  device_containsInsensitive?: Maybe<Scalars['String']>
  device_not_containsInsensitive?: Maybe<Scalars['String']>
  device_startsWith?: Maybe<Scalars['String']>
  device_not_startsWith?: Maybe<Scalars['String']>
  device_endsWith?: Maybe<Scalars['String']>
  device_not_endsWith?: Maybe<Scalars['String']>
  deviceType_isNull?: Maybe<Scalars['Boolean']>
  deviceType_eq?: Maybe<Scalars['String']>
  deviceType_not_eq?: Maybe<Scalars['String']>
  deviceType_gt?: Maybe<Scalars['String']>
  deviceType_gte?: Maybe<Scalars['String']>
  deviceType_lt?: Maybe<Scalars['String']>
  deviceType_lte?: Maybe<Scalars['String']>
  deviceType_in?: Maybe<Array<Scalars['String']>>
  deviceType_not_in?: Maybe<Array<Scalars['String']>>
  deviceType_contains?: Maybe<Scalars['String']>
  deviceType_not_contains?: Maybe<Scalars['String']>
  deviceType_containsInsensitive?: Maybe<Scalars['String']>
  deviceType_not_containsInsensitive?: Maybe<Scalars['String']>
  deviceType_startsWith?: Maybe<Scalars['String']>
  deviceType_not_startsWith?: Maybe<Scalars['String']>
  deviceType_endsWith?: Maybe<Scalars['String']>
  deviceType_not_endsWith?: Maybe<Scalars['String']>
  user_isNull?: Maybe<Scalars['Boolean']>
  user?: Maybe<UserWhereInput>
  account_isNull?: Maybe<Scalars['Boolean']>
  account?: Maybe<AccountWhereInput>
  ip_isNull?: Maybe<Scalars['Boolean']>
  ip_eq?: Maybe<Scalars['String']>
  ip_not_eq?: Maybe<Scalars['String']>
  ip_gt?: Maybe<Scalars['String']>
  ip_gte?: Maybe<Scalars['String']>
  ip_lt?: Maybe<Scalars['String']>
  ip_lte?: Maybe<Scalars['String']>
  ip_in?: Maybe<Array<Scalars['String']>>
  ip_not_in?: Maybe<Array<Scalars['String']>>
  ip_contains?: Maybe<Scalars['String']>
  ip_not_contains?: Maybe<Scalars['String']>
  ip_containsInsensitive?: Maybe<Scalars['String']>
  ip_not_containsInsensitive?: Maybe<Scalars['String']>
  ip_startsWith?: Maybe<Scalars['String']>
  ip_not_startsWith?: Maybe<Scalars['String']>
  ip_endsWith?: Maybe<Scalars['String']>
  ip_not_endsWith?: Maybe<Scalars['String']>
  startedAt_isNull?: Maybe<Scalars['Boolean']>
  startedAt_eq?: Maybe<Scalars['DateTime']>
  startedAt_not_eq?: Maybe<Scalars['DateTime']>
  startedAt_gt?: Maybe<Scalars['DateTime']>
  startedAt_gte?: Maybe<Scalars['DateTime']>
  startedAt_lt?: Maybe<Scalars['DateTime']>
  startedAt_lte?: Maybe<Scalars['DateTime']>
  startedAt_in?: Maybe<Array<Scalars['DateTime']>>
  startedAt_not_in?: Maybe<Array<Scalars['DateTime']>>
  expiry_isNull?: Maybe<Scalars['Boolean']>
  expiry_eq?: Maybe<Scalars['DateTime']>
  expiry_not_eq?: Maybe<Scalars['DateTime']>
  expiry_gt?: Maybe<Scalars['DateTime']>
  expiry_gte?: Maybe<Scalars['DateTime']>
  expiry_lt?: Maybe<Scalars['DateTime']>
  expiry_lte?: Maybe<Scalars['DateTime']>
  expiry_in?: Maybe<Array<Scalars['DateTime']>>
  expiry_not_in?: Maybe<Array<Scalars['DateTime']>>
  AND?: Maybe<Array<SessionWhereInput>>
  OR?: Maybe<Array<SessionWhereInput>>
}

export type SessionsConnection = {
  edges: Array<SessionEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type SetCategoryFeaturedVideosResult = {
  categoryId: Scalars['String']
  numberOfFeaturedVideosUnset: Scalars['Int']
  numberOfFeaturedVideosSet: Scalars['Int']
}

export type SetFeaturedNftsResult = {
  /** The updated number of nft that are now explicitly featured by the Gateway */
  newNumberOfNftsFeatured?: Maybe<Scalars['Int']>
}

export type SetNewAppAssetStorageResult = {
  /** The app asset storage link just set */
  newAppAssetStorage: Scalars['String']
}

export type SetNewAppNameAltResult = {
  /** The app name alternative just set */
  newAppNameAlt: Scalars['String']
}

export type SetNewNotificationAssetRootResult = {
  /** The notification asset root link just set */
  newNotificationAssetRoot: Scalars['String']
}

export type SetOrUnsetPublicFeedResult = {
  numberOfEntitiesAffected: Scalars['Int']
}

export type SetSupportedCategoriesResult = {
  /** The updated number of categories that are now explicitly supported by the Gateway */
  newNumberOfCategoriesSupported?: Maybe<Scalars['Int']>
  /** Whether or not newly created video categories will be automatically supported */
  newlyCreatedCategoriesSupported: Scalars['Boolean']
  /** Whether or not vidoes w/o any category assigned will be supported */
  noCategoryVideosSupported: Scalars['Boolean']
}

export type SetVideoHeroResult = {
  id: Scalars['String']
}

export type SquidStatus = {
  /** The height of the processed part of the chain */
  height?: Maybe<Scalars['Int']>
}

export type StorageBag = {
  /** Storage bag id */
  id: Scalars['String']
  /** Data objects in the bag */
  objects: Array<StorageDataObject>
  /** Storage buckets assigned to the bag */
  storageBuckets: Array<StorageBucketBag>
  /** Distribution buckets assigned to the bag */
  distributionBuckets: Array<DistributionBucketBag>
  /** Owner of the storage bag */
  owner: StorageBagOwner
}

export type StorageBagObjectsArgs = {
  where?: Maybe<StorageDataObjectWhereInput>
  orderBy?: Maybe<Array<StorageDataObjectOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type StorageBagStorageBucketsArgs = {
  where?: Maybe<StorageBucketBagWhereInput>
  orderBy?: Maybe<Array<StorageBucketBagOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type StorageBagDistributionBucketsArgs = {
  where?: Maybe<DistributionBucketBagWhereInput>
  orderBy?: Maybe<Array<DistributionBucketBagOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type StorageBagEdge = {
  node: StorageBag
  cursor: Scalars['String']
}

export enum StorageBagOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  OwnerPhantomAsc = 'owner_phantom_ASC',
  OwnerPhantomDesc = 'owner_phantom_DESC',
  OwnerWorkingGroupIdAsc = 'owner_workingGroupId_ASC',
  OwnerWorkingGroupIdDesc = 'owner_workingGroupId_DESC',
  OwnerMemberIdAsc = 'owner_memberId_ASC',
  OwnerMemberIdDesc = 'owner_memberId_DESC',
  OwnerChannelIdAsc = 'owner_channelId_ASC',
  OwnerChannelIdDesc = 'owner_channelId_DESC',
  OwnerDaoIdAsc = 'owner_daoId_ASC',
  OwnerDaoIdDesc = 'owner_daoId_DESC',
  OwnerIsTypeOfAsc = 'owner_isTypeOf_ASC',
  OwnerIsTypeOfDesc = 'owner_isTypeOf_DESC',
}

export type StorageBagOwner =
  | StorageBagOwnerCouncil
  | StorageBagOwnerWorkingGroup
  | StorageBagOwnerMember
  | StorageBagOwnerChannel
  | StorageBagOwnerDao

export type StorageBagOwnerChannel = {
  channelId: Scalars['String']
}

export type StorageBagOwnerCouncil = {
  phantom?: Maybe<Scalars['Int']>
}

export type StorageBagOwnerDao = {
  daoId?: Maybe<Scalars['Int']>
}

export type StorageBagOwnerMember = {
  memberId: Scalars['String']
}

export type StorageBagOwnerWhereInput = {
  phantom_isNull?: Maybe<Scalars['Boolean']>
  phantom_eq?: Maybe<Scalars['Int']>
  phantom_not_eq?: Maybe<Scalars['Int']>
  phantom_gt?: Maybe<Scalars['Int']>
  phantom_gte?: Maybe<Scalars['Int']>
  phantom_lt?: Maybe<Scalars['Int']>
  phantom_lte?: Maybe<Scalars['Int']>
  phantom_in?: Maybe<Array<Scalars['Int']>>
  phantom_not_in?: Maybe<Array<Scalars['Int']>>
  workingGroupId_isNull?: Maybe<Scalars['Boolean']>
  workingGroupId_eq?: Maybe<Scalars['String']>
  workingGroupId_not_eq?: Maybe<Scalars['String']>
  workingGroupId_gt?: Maybe<Scalars['String']>
  workingGroupId_gte?: Maybe<Scalars['String']>
  workingGroupId_lt?: Maybe<Scalars['String']>
  workingGroupId_lte?: Maybe<Scalars['String']>
  workingGroupId_in?: Maybe<Array<Scalars['String']>>
  workingGroupId_not_in?: Maybe<Array<Scalars['String']>>
  workingGroupId_contains?: Maybe<Scalars['String']>
  workingGroupId_not_contains?: Maybe<Scalars['String']>
  workingGroupId_containsInsensitive?: Maybe<Scalars['String']>
  workingGroupId_not_containsInsensitive?: Maybe<Scalars['String']>
  workingGroupId_startsWith?: Maybe<Scalars['String']>
  workingGroupId_not_startsWith?: Maybe<Scalars['String']>
  workingGroupId_endsWith?: Maybe<Scalars['String']>
  workingGroupId_not_endsWith?: Maybe<Scalars['String']>
  memberId_isNull?: Maybe<Scalars['Boolean']>
  memberId_eq?: Maybe<Scalars['String']>
  memberId_not_eq?: Maybe<Scalars['String']>
  memberId_gt?: Maybe<Scalars['String']>
  memberId_gte?: Maybe<Scalars['String']>
  memberId_lt?: Maybe<Scalars['String']>
  memberId_lte?: Maybe<Scalars['String']>
  memberId_in?: Maybe<Array<Scalars['String']>>
  memberId_not_in?: Maybe<Array<Scalars['String']>>
  memberId_contains?: Maybe<Scalars['String']>
  memberId_not_contains?: Maybe<Scalars['String']>
  memberId_containsInsensitive?: Maybe<Scalars['String']>
  memberId_not_containsInsensitive?: Maybe<Scalars['String']>
  memberId_startsWith?: Maybe<Scalars['String']>
  memberId_not_startsWith?: Maybe<Scalars['String']>
  memberId_endsWith?: Maybe<Scalars['String']>
  memberId_not_endsWith?: Maybe<Scalars['String']>
  channelId_isNull?: Maybe<Scalars['Boolean']>
  channelId_eq?: Maybe<Scalars['String']>
  channelId_not_eq?: Maybe<Scalars['String']>
  channelId_gt?: Maybe<Scalars['String']>
  channelId_gte?: Maybe<Scalars['String']>
  channelId_lt?: Maybe<Scalars['String']>
  channelId_lte?: Maybe<Scalars['String']>
  channelId_in?: Maybe<Array<Scalars['String']>>
  channelId_not_in?: Maybe<Array<Scalars['String']>>
  channelId_contains?: Maybe<Scalars['String']>
  channelId_not_contains?: Maybe<Scalars['String']>
  channelId_containsInsensitive?: Maybe<Scalars['String']>
  channelId_not_containsInsensitive?: Maybe<Scalars['String']>
  channelId_startsWith?: Maybe<Scalars['String']>
  channelId_not_startsWith?: Maybe<Scalars['String']>
  channelId_endsWith?: Maybe<Scalars['String']>
  channelId_not_endsWith?: Maybe<Scalars['String']>
  daoId_isNull?: Maybe<Scalars['Boolean']>
  daoId_eq?: Maybe<Scalars['Int']>
  daoId_not_eq?: Maybe<Scalars['Int']>
  daoId_gt?: Maybe<Scalars['Int']>
  daoId_gte?: Maybe<Scalars['Int']>
  daoId_lt?: Maybe<Scalars['Int']>
  daoId_lte?: Maybe<Scalars['Int']>
  daoId_in?: Maybe<Array<Scalars['Int']>>
  daoId_not_in?: Maybe<Array<Scalars['Int']>>
  isTypeOf_isNull?: Maybe<Scalars['Boolean']>
  isTypeOf_eq?: Maybe<Scalars['String']>
  isTypeOf_not_eq?: Maybe<Scalars['String']>
  isTypeOf_gt?: Maybe<Scalars['String']>
  isTypeOf_gte?: Maybe<Scalars['String']>
  isTypeOf_lt?: Maybe<Scalars['String']>
  isTypeOf_lte?: Maybe<Scalars['String']>
  isTypeOf_in?: Maybe<Array<Scalars['String']>>
  isTypeOf_not_in?: Maybe<Array<Scalars['String']>>
  isTypeOf_contains?: Maybe<Scalars['String']>
  isTypeOf_not_contains?: Maybe<Scalars['String']>
  isTypeOf_containsInsensitive?: Maybe<Scalars['String']>
  isTypeOf_not_containsInsensitive?: Maybe<Scalars['String']>
  isTypeOf_startsWith?: Maybe<Scalars['String']>
  isTypeOf_not_startsWith?: Maybe<Scalars['String']>
  isTypeOf_endsWith?: Maybe<Scalars['String']>
  isTypeOf_not_endsWith?: Maybe<Scalars['String']>
}

export type StorageBagOwnerWorkingGroup = {
  workingGroupId?: Maybe<Scalars['String']>
}

export type StorageBagWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  objects_every?: Maybe<StorageDataObjectWhereInput>
  objects_some?: Maybe<StorageDataObjectWhereInput>
  objects_none?: Maybe<StorageDataObjectWhereInput>
  storageBuckets_every?: Maybe<StorageBucketBagWhereInput>
  storageBuckets_some?: Maybe<StorageBucketBagWhereInput>
  storageBuckets_none?: Maybe<StorageBucketBagWhereInput>
  distributionBuckets_every?: Maybe<DistributionBucketBagWhereInput>
  distributionBuckets_some?: Maybe<DistributionBucketBagWhereInput>
  distributionBuckets_none?: Maybe<DistributionBucketBagWhereInput>
  owner_isNull?: Maybe<Scalars['Boolean']>
  owner?: Maybe<StorageBagOwnerWhereInput>
  AND?: Maybe<Array<StorageBagWhereInput>>
  OR?: Maybe<Array<StorageBagWhereInput>>
}

export type StorageBagsConnection = {
  edges: Array<StorageBagEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type StorageBucket = {
  /** Runtime bucket id */
  id: Scalars['String']
  /** Current bucket operator status */
  operatorStatus: StorageBucketOperatorStatus
  /** Storage bucket operator metadata */
  operatorMetadata?: Maybe<StorageBucketOperatorMetadata>
  /** Whether the bucket is accepting any new storage bags */
  acceptingNewBags: Scalars['Boolean']
  /** Storage bags assigned to the bucket */
  bags: Array<StorageBucketBag>
  /** Bucket's data object size limit in bytes */
  dataObjectsSizeLimit: Scalars['BigInt']
  /** Bucket's data object count limit */
  dataObjectCountLimit: Scalars['BigInt']
  /** Number of assigned data objects */
  dataObjectsCount: Scalars['BigInt']
  /** Total size of assigned data objects */
  dataObjectsSize: Scalars['BigInt']
}

export type StorageBucketBagsArgs = {
  where?: Maybe<StorageBucketBagWhereInput>
  orderBy?: Maybe<Array<StorageBucketBagOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type StorageBucketBag = {
  /** {storageBucketId}-{storageBagId} */
  id: Scalars['String']
  storageBucket: StorageBucket
  bag: StorageBag
}

export type StorageBucketBagEdge = {
  node: StorageBucketBag
  cursor: Scalars['String']
}

export enum StorageBucketBagOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  StorageBucketIdAsc = 'storageBucket_id_ASC',
  StorageBucketIdDesc = 'storageBucket_id_DESC',
  StorageBucketAcceptingNewBagsAsc = 'storageBucket_acceptingNewBags_ASC',
  StorageBucketAcceptingNewBagsDesc = 'storageBucket_acceptingNewBags_DESC',
  StorageBucketDataObjectsSizeLimitAsc = 'storageBucket_dataObjectsSizeLimit_ASC',
  StorageBucketDataObjectsSizeLimitDesc = 'storageBucket_dataObjectsSizeLimit_DESC',
  StorageBucketDataObjectCountLimitAsc = 'storageBucket_dataObjectCountLimit_ASC',
  StorageBucketDataObjectCountLimitDesc = 'storageBucket_dataObjectCountLimit_DESC',
  StorageBucketDataObjectsCountAsc = 'storageBucket_dataObjectsCount_ASC',
  StorageBucketDataObjectsCountDesc = 'storageBucket_dataObjectsCount_DESC',
  StorageBucketDataObjectsSizeAsc = 'storageBucket_dataObjectsSize_ASC',
  StorageBucketDataObjectsSizeDesc = 'storageBucket_dataObjectsSize_DESC',
  BagIdAsc = 'bag_id_ASC',
  BagIdDesc = 'bag_id_DESC',
}

export type StorageBucketBagWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  storageBucket_isNull?: Maybe<Scalars['Boolean']>
  storageBucket?: Maybe<StorageBucketWhereInput>
  bag_isNull?: Maybe<Scalars['Boolean']>
  bag?: Maybe<StorageBagWhereInput>
  AND?: Maybe<Array<StorageBucketBagWhereInput>>
  OR?: Maybe<Array<StorageBucketBagWhereInput>>
}

export type StorageBucketBagsConnection = {
  edges: Array<StorageBucketBagEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type StorageBucketEdge = {
  node: StorageBucket
  cursor: Scalars['String']
}

export type StorageBucketOperatorMetadata = {
  id: Scalars['String']
  /** Storage bucket to which the metadata is assigned */
  storageBucket: StorageBucket
  /** Root node endpoint */
  nodeEndpoint?: Maybe<Scalars['String']>
  /** Optional node location metadata */
  nodeLocation?: Maybe<NodeLocationMetadata>
  /** Additional information about the node/operator */
  extra?: Maybe<Scalars['String']>
}

export type StorageBucketOperatorMetadataConnection = {
  edges: Array<StorageBucketOperatorMetadataEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type StorageBucketOperatorMetadataEdge = {
  node: StorageBucketOperatorMetadata
  cursor: Scalars['String']
}

export enum StorageBucketOperatorMetadataOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  StorageBucketIdAsc = 'storageBucket_id_ASC',
  StorageBucketIdDesc = 'storageBucket_id_DESC',
  StorageBucketAcceptingNewBagsAsc = 'storageBucket_acceptingNewBags_ASC',
  StorageBucketAcceptingNewBagsDesc = 'storageBucket_acceptingNewBags_DESC',
  StorageBucketDataObjectsSizeLimitAsc = 'storageBucket_dataObjectsSizeLimit_ASC',
  StorageBucketDataObjectsSizeLimitDesc = 'storageBucket_dataObjectsSizeLimit_DESC',
  StorageBucketDataObjectCountLimitAsc = 'storageBucket_dataObjectCountLimit_ASC',
  StorageBucketDataObjectCountLimitDesc = 'storageBucket_dataObjectCountLimit_DESC',
  StorageBucketDataObjectsCountAsc = 'storageBucket_dataObjectsCount_ASC',
  StorageBucketDataObjectsCountDesc = 'storageBucket_dataObjectsCount_DESC',
  StorageBucketDataObjectsSizeAsc = 'storageBucket_dataObjectsSize_ASC',
  StorageBucketDataObjectsSizeDesc = 'storageBucket_dataObjectsSize_DESC',
  NodeEndpointAsc = 'nodeEndpoint_ASC',
  NodeEndpointDesc = 'nodeEndpoint_DESC',
  NodeLocationCountryCodeAsc = 'nodeLocation_countryCode_ASC',
  NodeLocationCountryCodeDesc = 'nodeLocation_countryCode_DESC',
  NodeLocationCityAsc = 'nodeLocation_city_ASC',
  NodeLocationCityDesc = 'nodeLocation_city_DESC',
  ExtraAsc = 'extra_ASC',
  ExtraDesc = 'extra_DESC',
}

export type StorageBucketOperatorMetadataWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  storageBucket_isNull?: Maybe<Scalars['Boolean']>
  storageBucket?: Maybe<StorageBucketWhereInput>
  nodeEndpoint_isNull?: Maybe<Scalars['Boolean']>
  nodeEndpoint_eq?: Maybe<Scalars['String']>
  nodeEndpoint_not_eq?: Maybe<Scalars['String']>
  nodeEndpoint_gt?: Maybe<Scalars['String']>
  nodeEndpoint_gte?: Maybe<Scalars['String']>
  nodeEndpoint_lt?: Maybe<Scalars['String']>
  nodeEndpoint_lte?: Maybe<Scalars['String']>
  nodeEndpoint_in?: Maybe<Array<Scalars['String']>>
  nodeEndpoint_not_in?: Maybe<Array<Scalars['String']>>
  nodeEndpoint_contains?: Maybe<Scalars['String']>
  nodeEndpoint_not_contains?: Maybe<Scalars['String']>
  nodeEndpoint_containsInsensitive?: Maybe<Scalars['String']>
  nodeEndpoint_not_containsInsensitive?: Maybe<Scalars['String']>
  nodeEndpoint_startsWith?: Maybe<Scalars['String']>
  nodeEndpoint_not_startsWith?: Maybe<Scalars['String']>
  nodeEndpoint_endsWith?: Maybe<Scalars['String']>
  nodeEndpoint_not_endsWith?: Maybe<Scalars['String']>
  nodeLocation_isNull?: Maybe<Scalars['Boolean']>
  nodeLocation?: Maybe<NodeLocationMetadataWhereInput>
  extra_isNull?: Maybe<Scalars['Boolean']>
  extra_eq?: Maybe<Scalars['String']>
  extra_not_eq?: Maybe<Scalars['String']>
  extra_gt?: Maybe<Scalars['String']>
  extra_gte?: Maybe<Scalars['String']>
  extra_lt?: Maybe<Scalars['String']>
  extra_lte?: Maybe<Scalars['String']>
  extra_in?: Maybe<Array<Scalars['String']>>
  extra_not_in?: Maybe<Array<Scalars['String']>>
  extra_contains?: Maybe<Scalars['String']>
  extra_not_contains?: Maybe<Scalars['String']>
  extra_containsInsensitive?: Maybe<Scalars['String']>
  extra_not_containsInsensitive?: Maybe<Scalars['String']>
  extra_startsWith?: Maybe<Scalars['String']>
  extra_not_startsWith?: Maybe<Scalars['String']>
  extra_endsWith?: Maybe<Scalars['String']>
  extra_not_endsWith?: Maybe<Scalars['String']>
  AND?: Maybe<Array<StorageBucketOperatorMetadataWhereInput>>
  OR?: Maybe<Array<StorageBucketOperatorMetadataWhereInput>>
}

export type StorageBucketOperatorStatus =
  | StorageBucketOperatorStatusMissing
  | StorageBucketOperatorStatusInvited
  | StorageBucketOperatorStatusActive

export type StorageBucketOperatorStatusActive = {
  workerId: Scalars['Int']
  transactorAccountId: Scalars['String']
}

export type StorageBucketOperatorStatusInvited = {
  workerId: Scalars['Int']
}

export type StorageBucketOperatorStatusMissing = {
  phantom?: Maybe<Scalars['Int']>
}

export type StorageBucketOperatorStatusWhereInput = {
  phantom_isNull?: Maybe<Scalars['Boolean']>
  phantom_eq?: Maybe<Scalars['Int']>
  phantom_not_eq?: Maybe<Scalars['Int']>
  phantom_gt?: Maybe<Scalars['Int']>
  phantom_gte?: Maybe<Scalars['Int']>
  phantom_lt?: Maybe<Scalars['Int']>
  phantom_lte?: Maybe<Scalars['Int']>
  phantom_in?: Maybe<Array<Scalars['Int']>>
  phantom_not_in?: Maybe<Array<Scalars['Int']>>
  workerId_isNull?: Maybe<Scalars['Boolean']>
  workerId_eq?: Maybe<Scalars['Int']>
  workerId_not_eq?: Maybe<Scalars['Int']>
  workerId_gt?: Maybe<Scalars['Int']>
  workerId_gte?: Maybe<Scalars['Int']>
  workerId_lt?: Maybe<Scalars['Int']>
  workerId_lte?: Maybe<Scalars['Int']>
  workerId_in?: Maybe<Array<Scalars['Int']>>
  workerId_not_in?: Maybe<Array<Scalars['Int']>>
  transactorAccountId_isNull?: Maybe<Scalars['Boolean']>
  transactorAccountId_eq?: Maybe<Scalars['String']>
  transactorAccountId_not_eq?: Maybe<Scalars['String']>
  transactorAccountId_gt?: Maybe<Scalars['String']>
  transactorAccountId_gte?: Maybe<Scalars['String']>
  transactorAccountId_lt?: Maybe<Scalars['String']>
  transactorAccountId_lte?: Maybe<Scalars['String']>
  transactorAccountId_in?: Maybe<Array<Scalars['String']>>
  transactorAccountId_not_in?: Maybe<Array<Scalars['String']>>
  transactorAccountId_contains?: Maybe<Scalars['String']>
  transactorAccountId_not_contains?: Maybe<Scalars['String']>
  transactorAccountId_containsInsensitive?: Maybe<Scalars['String']>
  transactorAccountId_not_containsInsensitive?: Maybe<Scalars['String']>
  transactorAccountId_startsWith?: Maybe<Scalars['String']>
  transactorAccountId_not_startsWith?: Maybe<Scalars['String']>
  transactorAccountId_endsWith?: Maybe<Scalars['String']>
  transactorAccountId_not_endsWith?: Maybe<Scalars['String']>
  isTypeOf_isNull?: Maybe<Scalars['Boolean']>
  isTypeOf_eq?: Maybe<Scalars['String']>
  isTypeOf_not_eq?: Maybe<Scalars['String']>
  isTypeOf_gt?: Maybe<Scalars['String']>
  isTypeOf_gte?: Maybe<Scalars['String']>
  isTypeOf_lt?: Maybe<Scalars['String']>
  isTypeOf_lte?: Maybe<Scalars['String']>
  isTypeOf_in?: Maybe<Array<Scalars['String']>>
  isTypeOf_not_in?: Maybe<Array<Scalars['String']>>
  isTypeOf_contains?: Maybe<Scalars['String']>
  isTypeOf_not_contains?: Maybe<Scalars['String']>
  isTypeOf_containsInsensitive?: Maybe<Scalars['String']>
  isTypeOf_not_containsInsensitive?: Maybe<Scalars['String']>
  isTypeOf_startsWith?: Maybe<Scalars['String']>
  isTypeOf_not_startsWith?: Maybe<Scalars['String']>
  isTypeOf_endsWith?: Maybe<Scalars['String']>
  isTypeOf_not_endsWith?: Maybe<Scalars['String']>
}

export enum StorageBucketOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  OperatorStatusPhantomAsc = 'operatorStatus_phantom_ASC',
  OperatorStatusPhantomDesc = 'operatorStatus_phantom_DESC',
  OperatorStatusWorkerIdAsc = 'operatorStatus_workerId_ASC',
  OperatorStatusWorkerIdDesc = 'operatorStatus_workerId_DESC',
  OperatorStatusTransactorAccountIdAsc = 'operatorStatus_transactorAccountId_ASC',
  OperatorStatusTransactorAccountIdDesc = 'operatorStatus_transactorAccountId_DESC',
  OperatorStatusIsTypeOfAsc = 'operatorStatus_isTypeOf_ASC',
  OperatorStatusIsTypeOfDesc = 'operatorStatus_isTypeOf_DESC',
  OperatorMetadataIdAsc = 'operatorMetadata_id_ASC',
  OperatorMetadataIdDesc = 'operatorMetadata_id_DESC',
  OperatorMetadataNodeEndpointAsc = 'operatorMetadata_nodeEndpoint_ASC',
  OperatorMetadataNodeEndpointDesc = 'operatorMetadata_nodeEndpoint_DESC',
  OperatorMetadataExtraAsc = 'operatorMetadata_extra_ASC',
  OperatorMetadataExtraDesc = 'operatorMetadata_extra_DESC',
  AcceptingNewBagsAsc = 'acceptingNewBags_ASC',
  AcceptingNewBagsDesc = 'acceptingNewBags_DESC',
  DataObjectsSizeLimitAsc = 'dataObjectsSizeLimit_ASC',
  DataObjectsSizeLimitDesc = 'dataObjectsSizeLimit_DESC',
  DataObjectCountLimitAsc = 'dataObjectCountLimit_ASC',
  DataObjectCountLimitDesc = 'dataObjectCountLimit_DESC',
  DataObjectsCountAsc = 'dataObjectsCount_ASC',
  DataObjectsCountDesc = 'dataObjectsCount_DESC',
  DataObjectsSizeAsc = 'dataObjectsSize_ASC',
  DataObjectsSizeDesc = 'dataObjectsSize_DESC',
}

export type StorageBucketWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  operatorStatus_isNull?: Maybe<Scalars['Boolean']>
  operatorStatus?: Maybe<StorageBucketOperatorStatusWhereInput>
  operatorMetadata_isNull?: Maybe<Scalars['Boolean']>
  operatorMetadata?: Maybe<StorageBucketOperatorMetadataWhereInput>
  acceptingNewBags_isNull?: Maybe<Scalars['Boolean']>
  acceptingNewBags_eq?: Maybe<Scalars['Boolean']>
  acceptingNewBags_not_eq?: Maybe<Scalars['Boolean']>
  bags_every?: Maybe<StorageBucketBagWhereInput>
  bags_some?: Maybe<StorageBucketBagWhereInput>
  bags_none?: Maybe<StorageBucketBagWhereInput>
  dataObjectsSizeLimit_isNull?: Maybe<Scalars['Boolean']>
  dataObjectsSizeLimit_eq?: Maybe<Scalars['BigInt']>
  dataObjectsSizeLimit_not_eq?: Maybe<Scalars['BigInt']>
  dataObjectsSizeLimit_gt?: Maybe<Scalars['BigInt']>
  dataObjectsSizeLimit_gte?: Maybe<Scalars['BigInt']>
  dataObjectsSizeLimit_lt?: Maybe<Scalars['BigInt']>
  dataObjectsSizeLimit_lte?: Maybe<Scalars['BigInt']>
  dataObjectsSizeLimit_in?: Maybe<Array<Scalars['BigInt']>>
  dataObjectsSizeLimit_not_in?: Maybe<Array<Scalars['BigInt']>>
  dataObjectCountLimit_isNull?: Maybe<Scalars['Boolean']>
  dataObjectCountLimit_eq?: Maybe<Scalars['BigInt']>
  dataObjectCountLimit_not_eq?: Maybe<Scalars['BigInt']>
  dataObjectCountLimit_gt?: Maybe<Scalars['BigInt']>
  dataObjectCountLimit_gte?: Maybe<Scalars['BigInt']>
  dataObjectCountLimit_lt?: Maybe<Scalars['BigInt']>
  dataObjectCountLimit_lte?: Maybe<Scalars['BigInt']>
  dataObjectCountLimit_in?: Maybe<Array<Scalars['BigInt']>>
  dataObjectCountLimit_not_in?: Maybe<Array<Scalars['BigInt']>>
  dataObjectsCount_isNull?: Maybe<Scalars['Boolean']>
  dataObjectsCount_eq?: Maybe<Scalars['BigInt']>
  dataObjectsCount_not_eq?: Maybe<Scalars['BigInt']>
  dataObjectsCount_gt?: Maybe<Scalars['BigInt']>
  dataObjectsCount_gte?: Maybe<Scalars['BigInt']>
  dataObjectsCount_lt?: Maybe<Scalars['BigInt']>
  dataObjectsCount_lte?: Maybe<Scalars['BigInt']>
  dataObjectsCount_in?: Maybe<Array<Scalars['BigInt']>>
  dataObjectsCount_not_in?: Maybe<Array<Scalars['BigInt']>>
  dataObjectsSize_isNull?: Maybe<Scalars['Boolean']>
  dataObjectsSize_eq?: Maybe<Scalars['BigInt']>
  dataObjectsSize_not_eq?: Maybe<Scalars['BigInt']>
  dataObjectsSize_gt?: Maybe<Scalars['BigInt']>
  dataObjectsSize_gte?: Maybe<Scalars['BigInt']>
  dataObjectsSize_lt?: Maybe<Scalars['BigInt']>
  dataObjectsSize_lte?: Maybe<Scalars['BigInt']>
  dataObjectsSize_in?: Maybe<Array<Scalars['BigInt']>>
  dataObjectsSize_not_in?: Maybe<Array<Scalars['BigInt']>>
  AND?: Maybe<Array<StorageBucketWhereInput>>
  OR?: Maybe<Array<StorageBucketWhereInput>>
}

export type StorageBucketsConnection = {
  edges: Array<StorageBucketEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type StorageDataObject = {
  /** Data object runtime id */
  id: Scalars['String']
  /** Storage bag the data object is part of */
  storageBag: StorageBag
  /** Resolved asset urls */
  resolvedUrls: Array<Scalars['String']>
  /** Timestamp of the block the data object was created at */
  createdAt: Scalars['DateTime']
  /** Whether the data object was uploaded and accepted by the storage provider */
  isAccepted: Scalars['Boolean']
  /** Data object size in bytes */
  size: Scalars['BigInt']
  /** IPFS content hash */
  ipfsHash: Scalars['String']
  /** The type of the asset that the data object represents (if known) */
  type?: Maybe<DataObjectType>
  /** State Bloat Bond for removing the data object */
  stateBloatBond: Scalars['BigInt']
  /** If the object is no longer used as an asset - the time at which it was unset (if known) */
  unsetAt?: Maybe<Scalars['DateTime']>
}

export type StorageDataObjectEdge = {
  node: StorageDataObject
  cursor: Scalars['String']
}

export enum StorageDataObjectOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  CreatedAtAsc = 'createdAt_ASC',
  CreatedAtDesc = 'createdAt_DESC',
  IsAcceptedAsc = 'isAccepted_ASC',
  IsAcceptedDesc = 'isAccepted_DESC',
  SizeAsc = 'size_ASC',
  SizeDesc = 'size_DESC',
  StorageBagIdAsc = 'storageBag_id_ASC',
  StorageBagIdDesc = 'storageBag_id_DESC',
  IpfsHashAsc = 'ipfsHash_ASC',
  IpfsHashDesc = 'ipfsHash_DESC',
  TypePhantomAsc = 'type_phantom_ASC',
  TypePhantomDesc = 'type_phantom_DESC',
  TypeIsTypeOfAsc = 'type_isTypeOf_ASC',
  TypeIsTypeOfDesc = 'type_isTypeOf_DESC',
  StateBloatBondAsc = 'stateBloatBond_ASC',
  StateBloatBondDesc = 'stateBloatBond_DESC',
  UnsetAtAsc = 'unsetAt_ASC',
  UnsetAtDesc = 'unsetAt_DESC',
}

export type StorageDataObjectWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  createdAt_isNull?: Maybe<Scalars['Boolean']>
  createdAt_eq?: Maybe<Scalars['DateTime']>
  createdAt_not_eq?: Maybe<Scalars['DateTime']>
  createdAt_gt?: Maybe<Scalars['DateTime']>
  createdAt_gte?: Maybe<Scalars['DateTime']>
  createdAt_lt?: Maybe<Scalars['DateTime']>
  createdAt_lte?: Maybe<Scalars['DateTime']>
  createdAt_in?: Maybe<Array<Scalars['DateTime']>>
  createdAt_not_in?: Maybe<Array<Scalars['DateTime']>>
  isAccepted_isNull?: Maybe<Scalars['Boolean']>
  isAccepted_eq?: Maybe<Scalars['Boolean']>
  isAccepted_not_eq?: Maybe<Scalars['Boolean']>
  size_isNull?: Maybe<Scalars['Boolean']>
  size_eq?: Maybe<Scalars['BigInt']>
  size_not_eq?: Maybe<Scalars['BigInt']>
  size_gt?: Maybe<Scalars['BigInt']>
  size_gte?: Maybe<Scalars['BigInt']>
  size_lt?: Maybe<Scalars['BigInt']>
  size_lte?: Maybe<Scalars['BigInt']>
  size_in?: Maybe<Array<Scalars['BigInt']>>
  size_not_in?: Maybe<Array<Scalars['BigInt']>>
  storageBag_isNull?: Maybe<Scalars['Boolean']>
  storageBag?: Maybe<StorageBagWhereInput>
  ipfsHash_isNull?: Maybe<Scalars['Boolean']>
  ipfsHash_eq?: Maybe<Scalars['String']>
  ipfsHash_not_eq?: Maybe<Scalars['String']>
  ipfsHash_gt?: Maybe<Scalars['String']>
  ipfsHash_gte?: Maybe<Scalars['String']>
  ipfsHash_lt?: Maybe<Scalars['String']>
  ipfsHash_lte?: Maybe<Scalars['String']>
  ipfsHash_in?: Maybe<Array<Scalars['String']>>
  ipfsHash_not_in?: Maybe<Array<Scalars['String']>>
  ipfsHash_contains?: Maybe<Scalars['String']>
  ipfsHash_not_contains?: Maybe<Scalars['String']>
  ipfsHash_containsInsensitive?: Maybe<Scalars['String']>
  ipfsHash_not_containsInsensitive?: Maybe<Scalars['String']>
  ipfsHash_startsWith?: Maybe<Scalars['String']>
  ipfsHash_not_startsWith?: Maybe<Scalars['String']>
  ipfsHash_endsWith?: Maybe<Scalars['String']>
  ipfsHash_not_endsWith?: Maybe<Scalars['String']>
  type_isNull?: Maybe<Scalars['Boolean']>
  type?: Maybe<DataObjectTypeWhereInput>
  stateBloatBond_isNull?: Maybe<Scalars['Boolean']>
  stateBloatBond_eq?: Maybe<Scalars['BigInt']>
  stateBloatBond_not_eq?: Maybe<Scalars['BigInt']>
  stateBloatBond_gt?: Maybe<Scalars['BigInt']>
  stateBloatBond_gte?: Maybe<Scalars['BigInt']>
  stateBloatBond_lt?: Maybe<Scalars['BigInt']>
  stateBloatBond_lte?: Maybe<Scalars['BigInt']>
  stateBloatBond_in?: Maybe<Array<Scalars['BigInt']>>
  stateBloatBond_not_in?: Maybe<Array<Scalars['BigInt']>>
  unsetAt_isNull?: Maybe<Scalars['Boolean']>
  unsetAt_eq?: Maybe<Scalars['DateTime']>
  unsetAt_not_eq?: Maybe<Scalars['DateTime']>
  unsetAt_gt?: Maybe<Scalars['DateTime']>
  unsetAt_gte?: Maybe<Scalars['DateTime']>
  unsetAt_lt?: Maybe<Scalars['DateTime']>
  unsetAt_lte?: Maybe<Scalars['DateTime']>
  unsetAt_in?: Maybe<Array<Scalars['DateTime']>>
  unsetAt_not_in?: Maybe<Array<Scalars['DateTime']>>
  resolvedUrls_isNull?: Maybe<Scalars['Boolean']>
  resolvedUrls_containsAll?: Maybe<Array<Scalars['String']>>
  resolvedUrls_containsAny?: Maybe<Array<Scalars['String']>>
  resolvedUrls_containsNone?: Maybe<Array<Scalars['String']>>
  AND?: Maybe<Array<StorageDataObjectWhereInput>>
  OR?: Maybe<Array<StorageDataObjectWhereInput>>
}

export type StorageDataObjectsConnection = {
  edges: Array<StorageDataObjectEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type Subscription = {
  processorState: ProcessorState
}

export type SuspendChannelResult = {
  id: Scalars['String']
  channelId: Scalars['String']
  createdAt: Scalars['DateTime']
}

export type Token = {
  /** The token itself (32-byte string, securely random) */
  id: Scalars['String']
  /** Type of the token (its intended purpose) */
  type: TokenType
  /** When was the token issued */
  issuedAt: Scalars['DateTime']
  /** When does the token expire or when has it expired */
  expiry: Scalars['DateTime']
  /** The account the token was issued for */
  issuedFor: Account
}

export type TokenEdge = {
  node: Token
  cursor: Scalars['String']
}

export enum TokenOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  TypeAsc = 'type_ASC',
  TypeDesc = 'type_DESC',
  IssuedAtAsc = 'issuedAt_ASC',
  IssuedAtDesc = 'issuedAt_DESC',
  ExpiryAsc = 'expiry_ASC',
  ExpiryDesc = 'expiry_DESC',
  IssuedForIdAsc = 'issuedFor_id_ASC',
  IssuedForIdDesc = 'issuedFor_id_DESC',
  IssuedForEmailAsc = 'issuedFor_email_ASC',
  IssuedForEmailDesc = 'issuedFor_email_DESC',
  IssuedForIsEmailConfirmedAsc = 'issuedFor_isEmailConfirmed_ASC',
  IssuedForIsEmailConfirmedDesc = 'issuedFor_isEmailConfirmed_DESC',
  IssuedForIsBlockedAsc = 'issuedFor_isBlocked_ASC',
  IssuedForIsBlockedDesc = 'issuedFor_isBlocked_DESC',
  IssuedForRegisteredAtAsc = 'issuedFor_registeredAt_ASC',
  IssuedForRegisteredAtDesc = 'issuedFor_registeredAt_DESC',
  IssuedForJoystreamAccountAsc = 'issuedFor_joystreamAccount_ASC',
  IssuedForJoystreamAccountDesc = 'issuedFor_joystreamAccount_DESC',
  IssuedForReferrerChannelIdAsc = 'issuedFor_referrerChannelId_ASC',
  IssuedForReferrerChannelIdDesc = 'issuedFor_referrerChannelId_DESC',
}

export enum TokenType {
  EmailConfirmation = 'EMAIL_CONFIRMATION',
}

export type TokenWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  type_isNull?: Maybe<Scalars['Boolean']>
  type_eq?: Maybe<TokenType>
  type_not_eq?: Maybe<TokenType>
  type_in?: Maybe<Array<TokenType>>
  type_not_in?: Maybe<Array<TokenType>>
  issuedAt_isNull?: Maybe<Scalars['Boolean']>
  issuedAt_eq?: Maybe<Scalars['DateTime']>
  issuedAt_not_eq?: Maybe<Scalars['DateTime']>
  issuedAt_gt?: Maybe<Scalars['DateTime']>
  issuedAt_gte?: Maybe<Scalars['DateTime']>
  issuedAt_lt?: Maybe<Scalars['DateTime']>
  issuedAt_lte?: Maybe<Scalars['DateTime']>
  issuedAt_in?: Maybe<Array<Scalars['DateTime']>>
  issuedAt_not_in?: Maybe<Array<Scalars['DateTime']>>
  expiry_isNull?: Maybe<Scalars['Boolean']>
  expiry_eq?: Maybe<Scalars['DateTime']>
  expiry_not_eq?: Maybe<Scalars['DateTime']>
  expiry_gt?: Maybe<Scalars['DateTime']>
  expiry_gte?: Maybe<Scalars['DateTime']>
  expiry_lt?: Maybe<Scalars['DateTime']>
  expiry_lte?: Maybe<Scalars['DateTime']>
  expiry_in?: Maybe<Array<Scalars['DateTime']>>
  expiry_not_in?: Maybe<Array<Scalars['DateTime']>>
  issuedFor_isNull?: Maybe<Scalars['Boolean']>
  issuedFor?: Maybe<AccountWhereInput>
  AND?: Maybe<Array<TokenWhereInput>>
  OR?: Maybe<Array<TokenWhereInput>>
}

export type TokensConnection = {
  edges: Array<TokenEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type TopSellingChannelsResult = {
  channel: Channel
  amount: Scalars['String']
  nftSold: Scalars['Int']
}

/** NFT transactional state */
export type TransactionalStatus =
  | TransactionalStatusIdle
  | TransactionalStatusInitiatedOfferToMember
  | TransactionalStatusBuyNow
  | TransactionalStatusAuction

/** Represents TransactionalStatus Auction */
export type TransactionalStatusAuction = {
  auction: Auction
}

/** Represents TransactionalStatus BuyNow */
export type TransactionalStatusBuyNow = {
  price: Scalars['BigInt']
}

/** Represents TransactionalStatus Idle */
export type TransactionalStatusIdle = {
  phantom?: Maybe<Scalars['Int']>
}

/** Represents TransactionalStatus InitiatedOfferToMember */
export type TransactionalStatusInitiatedOfferToMember = {
  /** Member that recieved the offer */
  member: Membership
  /** The price that the member should pay to accept offer (optional) */
  price?: Maybe<Scalars['BigInt']>
}

export type TransactionalStatusWhereInput = {
  phantom_isNull?: Maybe<Scalars['Boolean']>
  phantom_eq?: Maybe<Scalars['Int']>
  phantom_not_eq?: Maybe<Scalars['Int']>
  phantom_gt?: Maybe<Scalars['Int']>
  phantom_gte?: Maybe<Scalars['Int']>
  phantom_lt?: Maybe<Scalars['Int']>
  phantom_lte?: Maybe<Scalars['Int']>
  phantom_in?: Maybe<Array<Scalars['Int']>>
  phantom_not_in?: Maybe<Array<Scalars['Int']>>
  member_isNull?: Maybe<Scalars['Boolean']>
  member?: Maybe<MembershipWhereInput>
  price_isNull?: Maybe<Scalars['Boolean']>
  price_eq?: Maybe<Scalars['BigInt']>
  price_not_eq?: Maybe<Scalars['BigInt']>
  price_gt?: Maybe<Scalars['BigInt']>
  price_gte?: Maybe<Scalars['BigInt']>
  price_lt?: Maybe<Scalars['BigInt']>
  price_lte?: Maybe<Scalars['BigInt']>
  price_in?: Maybe<Array<Scalars['BigInt']>>
  price_not_in?: Maybe<Array<Scalars['BigInt']>>
  auction_isNull?: Maybe<Scalars['Boolean']>
  auction?: Maybe<AuctionWhereInput>
  isTypeOf_isNull?: Maybe<Scalars['Boolean']>
  isTypeOf_eq?: Maybe<Scalars['String']>
  isTypeOf_not_eq?: Maybe<Scalars['String']>
  isTypeOf_gt?: Maybe<Scalars['String']>
  isTypeOf_gte?: Maybe<Scalars['String']>
  isTypeOf_lt?: Maybe<Scalars['String']>
  isTypeOf_lte?: Maybe<Scalars['String']>
  isTypeOf_in?: Maybe<Array<Scalars['String']>>
  isTypeOf_not_in?: Maybe<Array<Scalars['String']>>
  isTypeOf_contains?: Maybe<Scalars['String']>
  isTypeOf_not_contains?: Maybe<Scalars['String']>
  isTypeOf_containsInsensitive?: Maybe<Scalars['String']>
  isTypeOf_not_containsInsensitive?: Maybe<Scalars['String']>
  isTypeOf_startsWith?: Maybe<Scalars['String']>
  isTypeOf_not_startsWith?: Maybe<Scalars['String']>
  isTypeOf_endsWith?: Maybe<Scalars['String']>
  isTypeOf_not_endsWith?: Maybe<Scalars['String']>
}

export type Unread = {
  phantom?: Maybe<Scalars['Int']>
}

export type User = {
  /** Unique identifier (32-byte string, securely random) */
  id: Scalars['String']
  /** Whether the user has root (gateway operator) privileges */
  isRoot: Scalars['Boolean']
  /** List of all the gateway operator permissions that this user has */
  permissions?: Maybe<Array<OperatorPermission>>
  /** The account associated with the user (if any) */
  account?: Maybe<Account>
  /** User's channel follows */
  channelFollows: Array<ChannelFollow>
  /** Video views associated with the user */
  videoViewEvents: Array<VideoViewEvent>
  /** Reports associated with the user */
  reports: Array<Report>
  /** NFT featuring requests associated with the user */
  nftFeaturingRequests: Array<NftFeaturingRequest>
}

export type UserChannelFollowsArgs = {
  where?: Maybe<ChannelFollowWhereInput>
  orderBy?: Maybe<Array<ChannelFollowOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type UserVideoViewEventsArgs = {
  where?: Maybe<VideoViewEventWhereInput>
  orderBy?: Maybe<Array<VideoViewEventOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type UserReportsArgs = {
  where?: Maybe<ReportWhereInput>
  orderBy?: Maybe<Array<ReportOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type UserNftFeaturingRequestsArgs = {
  where?: Maybe<NftFeaturingRequestWhereInput>
  orderBy?: Maybe<Array<NftFeaturingRequestOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type UserEdge = {
  node: User
  cursor: Scalars['String']
}

export enum UserOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  IsRootAsc = 'isRoot_ASC',
  IsRootDesc = 'isRoot_DESC',
  AccountIdAsc = 'account_id_ASC',
  AccountIdDesc = 'account_id_DESC',
  AccountEmailAsc = 'account_email_ASC',
  AccountEmailDesc = 'account_email_DESC',
  AccountIsEmailConfirmedAsc = 'account_isEmailConfirmed_ASC',
  AccountIsEmailConfirmedDesc = 'account_isEmailConfirmed_DESC',
  AccountIsBlockedAsc = 'account_isBlocked_ASC',
  AccountIsBlockedDesc = 'account_isBlocked_DESC',
  AccountRegisteredAtAsc = 'account_registeredAt_ASC',
  AccountRegisteredAtDesc = 'account_registeredAt_DESC',
  AccountJoystreamAccountAsc = 'account_joystreamAccount_ASC',
  AccountJoystreamAccountDesc = 'account_joystreamAccount_DESC',
  AccountReferrerChannelIdAsc = 'account_referrerChannelId_ASC',
  AccountReferrerChannelIdDesc = 'account_referrerChannelId_DESC',
}

export type UserWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  isRoot_isNull?: Maybe<Scalars['Boolean']>
  isRoot_eq?: Maybe<Scalars['Boolean']>
  isRoot_not_eq?: Maybe<Scalars['Boolean']>
  permissions_isNull?: Maybe<Scalars['Boolean']>
  permissions_containsAll?: Maybe<Array<OperatorPermission>>
  permissions_containsAny?: Maybe<Array<OperatorPermission>>
  permissions_containsNone?: Maybe<Array<OperatorPermission>>
  account_isNull?: Maybe<Scalars['Boolean']>
  account?: Maybe<AccountWhereInput>
  channelFollows_every?: Maybe<ChannelFollowWhereInput>
  channelFollows_some?: Maybe<ChannelFollowWhereInput>
  channelFollows_none?: Maybe<ChannelFollowWhereInput>
  videoViewEvents_every?: Maybe<VideoViewEventWhereInput>
  videoViewEvents_some?: Maybe<VideoViewEventWhereInput>
  videoViewEvents_none?: Maybe<VideoViewEventWhereInput>
  reports_every?: Maybe<ReportWhereInput>
  reports_some?: Maybe<ReportWhereInput>
  reports_none?: Maybe<ReportWhereInput>
  nftFeaturingRequests_every?: Maybe<NftFeaturingRequestWhereInput>
  nftFeaturingRequests_some?: Maybe<NftFeaturingRequestWhereInput>
  nftFeaturingRequests_none?: Maybe<NftFeaturingRequestWhereInput>
  AND?: Maybe<Array<UserWhereInput>>
  OR?: Maybe<Array<UserWhereInput>>
}

export type UsersConnection = {
  edges: Array<UserEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type VerifyChannelResult = {
  id: Scalars['String']
  channelId: Scalars['String']
  createdAt: Scalars['DateTime']
}

export type Video = {
  /** Runtime identifier */
  id: Scalars['String']
  /** Timestamp of the block the video was created at */
  createdAt: Scalars['DateTime']
  /** Reference to videos's channel */
  channel: Channel
  /** Reference to a video category */
  category?: Maybe<VideoCategory>
  /** The title of the video */
  title?: Maybe<Scalars['String']>
  /** The description of the Video */
  description?: Maybe<Scalars['String']>
  /** Video duration in seconds */
  duration?: Maybe<Scalars['Int']>
  /** Video thumbnail asset (recommended ratio: 16:9) */
  thumbnailPhoto?: Maybe<StorageDataObject>
  /** Video's main langauge */
  language?: Maybe<Scalars['String']>
  /** Video's orion langauge */
  orionLanguage?: Maybe<Scalars['String']>
  /** Whether or not Video contains marketing */
  hasMarketing?: Maybe<Scalars['Boolean']>
  /** If the Video was published on other platform before beeing published on Joystream - the original publication date */
  publishedBeforeJoystream?: Maybe<Scalars['DateTime']>
  /** Whether the Video is supposed to be publically displayed */
  isPublic?: Maybe<Scalars['Boolean']>
  /** Flag signaling whether a video is censored. */
  isCensored: Scalars['Boolean']
  /** Whether a video has been excluded/hidden (by the gateway operator) */
  isExcluded: Scalars['Boolean']
  /** Video NFT details */
  nft?: Maybe<OwnedNft>
  /** Whether the Video contains explicit material. */
  isExplicit?: Maybe<Scalars['Boolean']>
  /** License under the video is published */
  license?: Maybe<License>
  /** Video media asset */
  media?: Maybe<StorageDataObject>
  /** Value of video state bloat bond fee paid by channel owner */
  videoStateBloatBond: Scalars['BigInt']
  /** Video file metadata */
  mediaMetadata?: Maybe<VideoMediaMetadata>
  /** Block the video was created in */
  createdInBlock: Scalars['Int']
  /** List of video subtitles */
  subtitles: Array<VideoSubtitle>
  /** Is comment section enabled (true if enabled) */
  isCommentSectionEnabled: Scalars['Boolean']
  /** channel owner pinned comment */
  pinnedComment?: Maybe<Comment>
  /** List of all video comments */
  comments: Array<Comment>
  /** Comments count */
  commentsCount: Scalars['Int']
  /** Is reactions feature enabled on video (true if enabled i.e. video can be reacted) */
  isReactionFeatureEnabled: Scalars['Boolean']
  /** List of all video reactions */
  reactions: Array<VideoReaction>
  /** Reactions count by reaction Id */
  reactionsCountByReactionId?: Maybe<Array<VideoReactionsCountByReactionType>>
  /** Reactions count */
  reactionsCount: Scalars['Int']
  /** Number of video views (to speed up orderBy queries by avoiding COUNT aggregation) */
  viewsNum: Scalars['Int']
  /** Application used for video creation */
  entryApp?: Maybe<App>
  /** Video ID coming from YPP */
  ytVideoId?: Maybe<Scalars['String']>
  /** Video relevance score based on the views, reactions, comments and update date */
  videoRelevance: Scalars['Float']
  /** Whether the video is a short format, vertical video (e.g. Youtube Shorts, TikTok, Instagram Reels) */
  isShort?: Maybe<Scalars['Boolean']>
  /** Optional boolean flag to indicate if the video should be included in the home feed/page. */
  includeInHomeFeed?: Maybe<Scalars['Boolean']>
}

export type VideoSubtitlesArgs = {
  where?: Maybe<VideoSubtitleWhereInput>
  orderBy?: Maybe<Array<VideoSubtitleOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type VideoCommentsArgs = {
  where?: Maybe<CommentWhereInput>
  orderBy?: Maybe<Array<CommentOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type VideoReactionsArgs = {
  where?: Maybe<VideoReactionWhereInput>
  orderBy?: Maybe<Array<VideoReactionOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type VideoCategoriesConnection = {
  edges: Array<VideoCategoryEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type VideoCategory = {
  /** Runtime identifier */
  id: Scalars['String']
  /** The name of the category */
  name?: Maybe<Scalars['String']>
  /** The description of the category */
  description?: Maybe<Scalars['String']>
  /** Parent category if defined */
  parentCategory?: Maybe<VideoCategory>
  videos: Array<Video>
  featuredVideos: Array<VideoFeaturedInCategory>
  /** Indicates whether the category is supported by the Gateway */
  isSupported: Scalars['Boolean']
  createdInBlock: Scalars['Int']
}

export type VideoCategoryVideosArgs = {
  where?: Maybe<VideoWhereInput>
  orderBy?: Maybe<Array<VideoOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type VideoCategoryFeaturedVideosArgs = {
  where?: Maybe<VideoFeaturedInCategoryWhereInput>
  orderBy?: Maybe<Array<VideoFeaturedInCategoryOrderByInput>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type VideoCategoryEdge = {
  node: VideoCategory
  cursor: Scalars['String']
}

export enum VideoCategoryOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  NameAsc = 'name_ASC',
  NameDesc = 'name_DESC',
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC',
  ParentCategoryIdAsc = 'parentCategory_id_ASC',
  ParentCategoryIdDesc = 'parentCategory_id_DESC',
  ParentCategoryNameAsc = 'parentCategory_name_ASC',
  ParentCategoryNameDesc = 'parentCategory_name_DESC',
  ParentCategoryDescriptionAsc = 'parentCategory_description_ASC',
  ParentCategoryDescriptionDesc = 'parentCategory_description_DESC',
  ParentCategoryIsSupportedAsc = 'parentCategory_isSupported_ASC',
  ParentCategoryIsSupportedDesc = 'parentCategory_isSupported_DESC',
  ParentCategoryCreatedInBlockAsc = 'parentCategory_createdInBlock_ASC',
  ParentCategoryCreatedInBlockDesc = 'parentCategory_createdInBlock_DESC',
  IsSupportedAsc = 'isSupported_ASC',
  IsSupportedDesc = 'isSupported_DESC',
  CreatedInBlockAsc = 'createdInBlock_ASC',
  CreatedInBlockDesc = 'createdInBlock_DESC',
}

export type VideoCategoryWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  name_isNull?: Maybe<Scalars['Boolean']>
  name_eq?: Maybe<Scalars['String']>
  name_not_eq?: Maybe<Scalars['String']>
  name_gt?: Maybe<Scalars['String']>
  name_gte?: Maybe<Scalars['String']>
  name_lt?: Maybe<Scalars['String']>
  name_lte?: Maybe<Scalars['String']>
  name_in?: Maybe<Array<Scalars['String']>>
  name_not_in?: Maybe<Array<Scalars['String']>>
  name_contains?: Maybe<Scalars['String']>
  name_not_contains?: Maybe<Scalars['String']>
  name_containsInsensitive?: Maybe<Scalars['String']>
  name_not_containsInsensitive?: Maybe<Scalars['String']>
  name_startsWith?: Maybe<Scalars['String']>
  name_not_startsWith?: Maybe<Scalars['String']>
  name_endsWith?: Maybe<Scalars['String']>
  name_not_endsWith?: Maybe<Scalars['String']>
  description_isNull?: Maybe<Scalars['Boolean']>
  description_eq?: Maybe<Scalars['String']>
  description_not_eq?: Maybe<Scalars['String']>
  description_gt?: Maybe<Scalars['String']>
  description_gte?: Maybe<Scalars['String']>
  description_lt?: Maybe<Scalars['String']>
  description_lte?: Maybe<Scalars['String']>
  description_in?: Maybe<Array<Scalars['String']>>
  description_not_in?: Maybe<Array<Scalars['String']>>
  description_contains?: Maybe<Scalars['String']>
  description_not_contains?: Maybe<Scalars['String']>
  description_containsInsensitive?: Maybe<Scalars['String']>
  description_not_containsInsensitive?: Maybe<Scalars['String']>
  description_startsWith?: Maybe<Scalars['String']>
  description_not_startsWith?: Maybe<Scalars['String']>
  description_endsWith?: Maybe<Scalars['String']>
  description_not_endsWith?: Maybe<Scalars['String']>
  parentCategory_isNull?: Maybe<Scalars['Boolean']>
  parentCategory?: Maybe<VideoCategoryWhereInput>
  videos_every?: Maybe<VideoWhereInput>
  videos_some?: Maybe<VideoWhereInput>
  videos_none?: Maybe<VideoWhereInput>
  featuredVideos_every?: Maybe<VideoFeaturedInCategoryWhereInput>
  featuredVideos_some?: Maybe<VideoFeaturedInCategoryWhereInput>
  featuredVideos_none?: Maybe<VideoFeaturedInCategoryWhereInput>
  isSupported_isNull?: Maybe<Scalars['Boolean']>
  isSupported_eq?: Maybe<Scalars['Boolean']>
  isSupported_not_eq?: Maybe<Scalars['Boolean']>
  createdInBlock_isNull?: Maybe<Scalars['Boolean']>
  createdInBlock_eq?: Maybe<Scalars['Int']>
  createdInBlock_not_eq?: Maybe<Scalars['Int']>
  createdInBlock_gt?: Maybe<Scalars['Int']>
  createdInBlock_gte?: Maybe<Scalars['Int']>
  createdInBlock_lt?: Maybe<Scalars['Int']>
  createdInBlock_lte?: Maybe<Scalars['Int']>
  createdInBlock_in?: Maybe<Array<Scalars['Int']>>
  createdInBlock_not_in?: Maybe<Array<Scalars['Int']>>
  AND?: Maybe<Array<VideoCategoryWhereInput>>
  OR?: Maybe<Array<VideoCategoryWhereInput>>
}

export type VideoCreatedEventData = {
  /** channel the video lives in */
  channel: Channel
  /** video just created */
  video: Video
}

export type VideoDisliked = {
  /** video Id used for link */
  videoId: Scalars['String']
  /** video title for notification text */
  videoTitle: Scalars['String']
  /** id for the member that dropped the dislike */
  memberId: Scalars['String']
  /** handle for the member that dropped the dislike */
  memberHandle: Scalars['String']
}

export type VideoEdge = {
  node: Video
  cursor: Scalars['String']
}

export type VideoExcluded = {
  /** video title used for notification text */
  videoTitle: Scalars['String']
}

export type VideoFeaturedInCategoriesConnection = {
  edges: Array<VideoFeaturedInCategoryEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type VideoFeaturedInCategory = {
  /** {categoryId-videoId} */
  id: Scalars['String']
  /** Video being featured */
  video: Video
  /** Category the video is featured in */
  category: VideoCategory
  /** Url to video fragment to be displayed in the UI */
  videoCutUrl?: Maybe<Scalars['String']>
}

export type VideoFeaturedInCategoryEdge = {
  node: VideoFeaturedInCategory
  cursor: Scalars['String']
}

export enum VideoFeaturedInCategoryOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  VideoIdAsc = 'video_id_ASC',
  VideoIdDesc = 'video_id_DESC',
  VideoCreatedAtAsc = 'video_createdAt_ASC',
  VideoCreatedAtDesc = 'video_createdAt_DESC',
  VideoTitleAsc = 'video_title_ASC',
  VideoTitleDesc = 'video_title_DESC',
  VideoDescriptionAsc = 'video_description_ASC',
  VideoDescriptionDesc = 'video_description_DESC',
  VideoDurationAsc = 'video_duration_ASC',
  VideoDurationDesc = 'video_duration_DESC',
  VideoLanguageAsc = 'video_language_ASC',
  VideoLanguageDesc = 'video_language_DESC',
  VideoOrionLanguageAsc = 'video_orionLanguage_ASC',
  VideoOrionLanguageDesc = 'video_orionLanguage_DESC',
  VideoHasMarketingAsc = 'video_hasMarketing_ASC',
  VideoHasMarketingDesc = 'video_hasMarketing_DESC',
  VideoPublishedBeforeJoystreamAsc = 'video_publishedBeforeJoystream_ASC',
  VideoPublishedBeforeJoystreamDesc = 'video_publishedBeforeJoystream_DESC',
  VideoIsPublicAsc = 'video_isPublic_ASC',
  VideoIsPublicDesc = 'video_isPublic_DESC',
  VideoIsCensoredAsc = 'video_isCensored_ASC',
  VideoIsCensoredDesc = 'video_isCensored_DESC',
  VideoIsExcludedAsc = 'video_isExcluded_ASC',
  VideoIsExcludedDesc = 'video_isExcluded_DESC',
  VideoIsExplicitAsc = 'video_isExplicit_ASC',
  VideoIsExplicitDesc = 'video_isExplicit_DESC',
  VideoVideoStateBloatBondAsc = 'video_videoStateBloatBond_ASC',
  VideoVideoStateBloatBondDesc = 'video_videoStateBloatBond_DESC',
  VideoCreatedInBlockAsc = 'video_createdInBlock_ASC',
  VideoCreatedInBlockDesc = 'video_createdInBlock_DESC',
  VideoIsCommentSectionEnabledAsc = 'video_isCommentSectionEnabled_ASC',
  VideoIsCommentSectionEnabledDesc = 'video_isCommentSectionEnabled_DESC',
  VideoCommentsCountAsc = 'video_commentsCount_ASC',
  VideoCommentsCountDesc = 'video_commentsCount_DESC',
  VideoIsReactionFeatureEnabledAsc = 'video_isReactionFeatureEnabled_ASC',
  VideoIsReactionFeatureEnabledDesc = 'video_isReactionFeatureEnabled_DESC',
  VideoReactionsCountAsc = 'video_reactionsCount_ASC',
  VideoReactionsCountDesc = 'video_reactionsCount_DESC',
  VideoViewsNumAsc = 'video_viewsNum_ASC',
  VideoViewsNumDesc = 'video_viewsNum_DESC',
  VideoYtVideoIdAsc = 'video_ytVideoId_ASC',
  VideoYtVideoIdDesc = 'video_ytVideoId_DESC',
  VideoVideoRelevanceAsc = 'video_videoRelevance_ASC',
  VideoVideoRelevanceDesc = 'video_videoRelevance_DESC',
  VideoIsShortAsc = 'video_isShort_ASC',
  VideoIsShortDesc = 'video_isShort_DESC',
  VideoIncludeInHomeFeedAsc = 'video_includeInHomeFeed_ASC',
  VideoIncludeInHomeFeedDesc = 'video_includeInHomeFeed_DESC',
  CategoryIdAsc = 'category_id_ASC',
  CategoryIdDesc = 'category_id_DESC',
  CategoryNameAsc = 'category_name_ASC',
  CategoryNameDesc = 'category_name_DESC',
  CategoryDescriptionAsc = 'category_description_ASC',
  CategoryDescriptionDesc = 'category_description_DESC',
  CategoryIsSupportedAsc = 'category_isSupported_ASC',
  CategoryIsSupportedDesc = 'category_isSupported_DESC',
  CategoryCreatedInBlockAsc = 'category_createdInBlock_ASC',
  CategoryCreatedInBlockDesc = 'category_createdInBlock_DESC',
  VideoCutUrlAsc = 'videoCutUrl_ASC',
  VideoCutUrlDesc = 'videoCutUrl_DESC',
}

export type VideoFeaturedInCategoryWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  video_isNull?: Maybe<Scalars['Boolean']>
  video?: Maybe<VideoWhereInput>
  category_isNull?: Maybe<Scalars['Boolean']>
  category?: Maybe<VideoCategoryWhereInput>
  videoCutUrl_isNull?: Maybe<Scalars['Boolean']>
  videoCutUrl_eq?: Maybe<Scalars['String']>
  videoCutUrl_not_eq?: Maybe<Scalars['String']>
  videoCutUrl_gt?: Maybe<Scalars['String']>
  videoCutUrl_gte?: Maybe<Scalars['String']>
  videoCutUrl_lt?: Maybe<Scalars['String']>
  videoCutUrl_lte?: Maybe<Scalars['String']>
  videoCutUrl_in?: Maybe<Array<Scalars['String']>>
  videoCutUrl_not_in?: Maybe<Array<Scalars['String']>>
  videoCutUrl_contains?: Maybe<Scalars['String']>
  videoCutUrl_not_contains?: Maybe<Scalars['String']>
  videoCutUrl_containsInsensitive?: Maybe<Scalars['String']>
  videoCutUrl_not_containsInsensitive?: Maybe<Scalars['String']>
  videoCutUrl_startsWith?: Maybe<Scalars['String']>
  videoCutUrl_not_startsWith?: Maybe<Scalars['String']>
  videoCutUrl_endsWith?: Maybe<Scalars['String']>
  videoCutUrl_not_endsWith?: Maybe<Scalars['String']>
  AND?: Maybe<Array<VideoFeaturedInCategoryWhereInput>>
  OR?: Maybe<Array<VideoFeaturedInCategoryWhereInput>>
}

export type VideoHero = {
  /** Unique ID */
  id: Scalars['String']
  /** Video being featured in the Hero section */
  video: Video
  /** Title of the Hero section */
  heroTitle: Scalars['String']
  /** Url to video fragment to be displayed in the Hero section */
  heroVideoCutUrl: Scalars['String']
  /** Url to the poster to be displayed in the Hero section */
  heroPosterUrl: Scalars['String']
  /** Time at which this VideoHero was created/activated */
  activatedAt?: Maybe<Scalars['DateTime']>
}

export type VideoHeroEdge = {
  node: VideoHero
  cursor: Scalars['String']
}

export enum VideoHeroOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  VideoIdAsc = 'video_id_ASC',
  VideoIdDesc = 'video_id_DESC',
  VideoCreatedAtAsc = 'video_createdAt_ASC',
  VideoCreatedAtDesc = 'video_createdAt_DESC',
  VideoTitleAsc = 'video_title_ASC',
  VideoTitleDesc = 'video_title_DESC',
  VideoDescriptionAsc = 'video_description_ASC',
  VideoDescriptionDesc = 'video_description_DESC',
  VideoDurationAsc = 'video_duration_ASC',
  VideoDurationDesc = 'video_duration_DESC',
  VideoLanguageAsc = 'video_language_ASC',
  VideoLanguageDesc = 'video_language_DESC',
  VideoOrionLanguageAsc = 'video_orionLanguage_ASC',
  VideoOrionLanguageDesc = 'video_orionLanguage_DESC',
  VideoHasMarketingAsc = 'video_hasMarketing_ASC',
  VideoHasMarketingDesc = 'video_hasMarketing_DESC',
  VideoPublishedBeforeJoystreamAsc = 'video_publishedBeforeJoystream_ASC',
  VideoPublishedBeforeJoystreamDesc = 'video_publishedBeforeJoystream_DESC',
  VideoIsPublicAsc = 'video_isPublic_ASC',
  VideoIsPublicDesc = 'video_isPublic_DESC',
  VideoIsCensoredAsc = 'video_isCensored_ASC',
  VideoIsCensoredDesc = 'video_isCensored_DESC',
  VideoIsExcludedAsc = 'video_isExcluded_ASC',
  VideoIsExcludedDesc = 'video_isExcluded_DESC',
  VideoIsExplicitAsc = 'video_isExplicit_ASC',
  VideoIsExplicitDesc = 'video_isExplicit_DESC',
  VideoVideoStateBloatBondAsc = 'video_videoStateBloatBond_ASC',
  VideoVideoStateBloatBondDesc = 'video_videoStateBloatBond_DESC',
  VideoCreatedInBlockAsc = 'video_createdInBlock_ASC',
  VideoCreatedInBlockDesc = 'video_createdInBlock_DESC',
  VideoIsCommentSectionEnabledAsc = 'video_isCommentSectionEnabled_ASC',
  VideoIsCommentSectionEnabledDesc = 'video_isCommentSectionEnabled_DESC',
  VideoCommentsCountAsc = 'video_commentsCount_ASC',
  VideoCommentsCountDesc = 'video_commentsCount_DESC',
  VideoIsReactionFeatureEnabledAsc = 'video_isReactionFeatureEnabled_ASC',
  VideoIsReactionFeatureEnabledDesc = 'video_isReactionFeatureEnabled_DESC',
  VideoReactionsCountAsc = 'video_reactionsCount_ASC',
  VideoReactionsCountDesc = 'video_reactionsCount_DESC',
  VideoViewsNumAsc = 'video_viewsNum_ASC',
  VideoViewsNumDesc = 'video_viewsNum_DESC',
  VideoYtVideoIdAsc = 'video_ytVideoId_ASC',
  VideoYtVideoIdDesc = 'video_ytVideoId_DESC',
  VideoVideoRelevanceAsc = 'video_videoRelevance_ASC',
  VideoVideoRelevanceDesc = 'video_videoRelevance_DESC',
  VideoIsShortAsc = 'video_isShort_ASC',
  VideoIsShortDesc = 'video_isShort_DESC',
  VideoIncludeInHomeFeedAsc = 'video_includeInHomeFeed_ASC',
  VideoIncludeInHomeFeedDesc = 'video_includeInHomeFeed_DESC',
  HeroTitleAsc = 'heroTitle_ASC',
  HeroTitleDesc = 'heroTitle_DESC',
  HeroVideoCutUrlAsc = 'heroVideoCutUrl_ASC',
  HeroVideoCutUrlDesc = 'heroVideoCutUrl_DESC',
  HeroPosterUrlAsc = 'heroPosterUrl_ASC',
  HeroPosterUrlDesc = 'heroPosterUrl_DESC',
  ActivatedAtAsc = 'activatedAt_ASC',
  ActivatedAtDesc = 'activatedAt_DESC',
}

export type VideoHeroWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  video_isNull?: Maybe<Scalars['Boolean']>
  video?: Maybe<VideoWhereInput>
  heroTitle_isNull?: Maybe<Scalars['Boolean']>
  heroTitle_eq?: Maybe<Scalars['String']>
  heroTitle_not_eq?: Maybe<Scalars['String']>
  heroTitle_gt?: Maybe<Scalars['String']>
  heroTitle_gte?: Maybe<Scalars['String']>
  heroTitle_lt?: Maybe<Scalars['String']>
  heroTitle_lte?: Maybe<Scalars['String']>
  heroTitle_in?: Maybe<Array<Scalars['String']>>
  heroTitle_not_in?: Maybe<Array<Scalars['String']>>
  heroTitle_contains?: Maybe<Scalars['String']>
  heroTitle_not_contains?: Maybe<Scalars['String']>
  heroTitle_containsInsensitive?: Maybe<Scalars['String']>
  heroTitle_not_containsInsensitive?: Maybe<Scalars['String']>
  heroTitle_startsWith?: Maybe<Scalars['String']>
  heroTitle_not_startsWith?: Maybe<Scalars['String']>
  heroTitle_endsWith?: Maybe<Scalars['String']>
  heroTitle_not_endsWith?: Maybe<Scalars['String']>
  heroVideoCutUrl_isNull?: Maybe<Scalars['Boolean']>
  heroVideoCutUrl_eq?: Maybe<Scalars['String']>
  heroVideoCutUrl_not_eq?: Maybe<Scalars['String']>
  heroVideoCutUrl_gt?: Maybe<Scalars['String']>
  heroVideoCutUrl_gte?: Maybe<Scalars['String']>
  heroVideoCutUrl_lt?: Maybe<Scalars['String']>
  heroVideoCutUrl_lte?: Maybe<Scalars['String']>
  heroVideoCutUrl_in?: Maybe<Array<Scalars['String']>>
  heroVideoCutUrl_not_in?: Maybe<Array<Scalars['String']>>
  heroVideoCutUrl_contains?: Maybe<Scalars['String']>
  heroVideoCutUrl_not_contains?: Maybe<Scalars['String']>
  heroVideoCutUrl_containsInsensitive?: Maybe<Scalars['String']>
  heroVideoCutUrl_not_containsInsensitive?: Maybe<Scalars['String']>
  heroVideoCutUrl_startsWith?: Maybe<Scalars['String']>
  heroVideoCutUrl_not_startsWith?: Maybe<Scalars['String']>
  heroVideoCutUrl_endsWith?: Maybe<Scalars['String']>
  heroVideoCutUrl_not_endsWith?: Maybe<Scalars['String']>
  heroPosterUrl_isNull?: Maybe<Scalars['Boolean']>
  heroPosterUrl_eq?: Maybe<Scalars['String']>
  heroPosterUrl_not_eq?: Maybe<Scalars['String']>
  heroPosterUrl_gt?: Maybe<Scalars['String']>
  heroPosterUrl_gte?: Maybe<Scalars['String']>
  heroPosterUrl_lt?: Maybe<Scalars['String']>
  heroPosterUrl_lte?: Maybe<Scalars['String']>
  heroPosterUrl_in?: Maybe<Array<Scalars['String']>>
  heroPosterUrl_not_in?: Maybe<Array<Scalars['String']>>
  heroPosterUrl_contains?: Maybe<Scalars['String']>
  heroPosterUrl_not_contains?: Maybe<Scalars['String']>
  heroPosterUrl_containsInsensitive?: Maybe<Scalars['String']>
  heroPosterUrl_not_containsInsensitive?: Maybe<Scalars['String']>
  heroPosterUrl_startsWith?: Maybe<Scalars['String']>
  heroPosterUrl_not_startsWith?: Maybe<Scalars['String']>
  heroPosterUrl_endsWith?: Maybe<Scalars['String']>
  heroPosterUrl_not_endsWith?: Maybe<Scalars['String']>
  activatedAt_isNull?: Maybe<Scalars['Boolean']>
  activatedAt_eq?: Maybe<Scalars['DateTime']>
  activatedAt_not_eq?: Maybe<Scalars['DateTime']>
  activatedAt_gt?: Maybe<Scalars['DateTime']>
  activatedAt_gte?: Maybe<Scalars['DateTime']>
  activatedAt_lt?: Maybe<Scalars['DateTime']>
  activatedAt_lte?: Maybe<Scalars['DateTime']>
  activatedAt_in?: Maybe<Array<Scalars['DateTime']>>
  activatedAt_not_in?: Maybe<Array<Scalars['DateTime']>>
  AND?: Maybe<Array<VideoHeroWhereInput>>
  OR?: Maybe<Array<VideoHeroWhereInput>>
}

export type VideoHerosConnection = {
  edges: Array<VideoHeroEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type VideoLiked = {
  /** video Id used for link */
  videoId: Scalars['String']
  /** video title for notification text */
  videoTitle: Scalars['String']
  /** id for the member that dropped the like */
  memberId: Scalars['String']
  /** handle for the member that dropped the like */
  memberHandle: Scalars['String']
}

export type VideoMediaEncoding = {
  id: Scalars['String']
  /** Encoding of the video media object */
  codecName?: Maybe<Scalars['String']>
  /** Media container format */
  container?: Maybe<Scalars['String']>
  /** Content MIME type */
  mimeMediaType?: Maybe<Scalars['String']>
}

export type VideoMediaEncodingEdge = {
  node: VideoMediaEncoding
  cursor: Scalars['String']
}

export enum VideoMediaEncodingOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  CodecNameAsc = 'codecName_ASC',
  CodecNameDesc = 'codecName_DESC',
  ContainerAsc = 'container_ASC',
  ContainerDesc = 'container_DESC',
  MimeMediaTypeAsc = 'mimeMediaType_ASC',
  MimeMediaTypeDesc = 'mimeMediaType_DESC',
}

export type VideoMediaEncodingWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  codecName_isNull?: Maybe<Scalars['Boolean']>
  codecName_eq?: Maybe<Scalars['String']>
  codecName_not_eq?: Maybe<Scalars['String']>
  codecName_gt?: Maybe<Scalars['String']>
  codecName_gte?: Maybe<Scalars['String']>
  codecName_lt?: Maybe<Scalars['String']>
  codecName_lte?: Maybe<Scalars['String']>
  codecName_in?: Maybe<Array<Scalars['String']>>
  codecName_not_in?: Maybe<Array<Scalars['String']>>
  codecName_contains?: Maybe<Scalars['String']>
  codecName_not_contains?: Maybe<Scalars['String']>
  codecName_containsInsensitive?: Maybe<Scalars['String']>
  codecName_not_containsInsensitive?: Maybe<Scalars['String']>
  codecName_startsWith?: Maybe<Scalars['String']>
  codecName_not_startsWith?: Maybe<Scalars['String']>
  codecName_endsWith?: Maybe<Scalars['String']>
  codecName_not_endsWith?: Maybe<Scalars['String']>
  container_isNull?: Maybe<Scalars['Boolean']>
  container_eq?: Maybe<Scalars['String']>
  container_not_eq?: Maybe<Scalars['String']>
  container_gt?: Maybe<Scalars['String']>
  container_gte?: Maybe<Scalars['String']>
  container_lt?: Maybe<Scalars['String']>
  container_lte?: Maybe<Scalars['String']>
  container_in?: Maybe<Array<Scalars['String']>>
  container_not_in?: Maybe<Array<Scalars['String']>>
  container_contains?: Maybe<Scalars['String']>
  container_not_contains?: Maybe<Scalars['String']>
  container_containsInsensitive?: Maybe<Scalars['String']>
  container_not_containsInsensitive?: Maybe<Scalars['String']>
  container_startsWith?: Maybe<Scalars['String']>
  container_not_startsWith?: Maybe<Scalars['String']>
  container_endsWith?: Maybe<Scalars['String']>
  container_not_endsWith?: Maybe<Scalars['String']>
  mimeMediaType_isNull?: Maybe<Scalars['Boolean']>
  mimeMediaType_eq?: Maybe<Scalars['String']>
  mimeMediaType_not_eq?: Maybe<Scalars['String']>
  mimeMediaType_gt?: Maybe<Scalars['String']>
  mimeMediaType_gte?: Maybe<Scalars['String']>
  mimeMediaType_lt?: Maybe<Scalars['String']>
  mimeMediaType_lte?: Maybe<Scalars['String']>
  mimeMediaType_in?: Maybe<Array<Scalars['String']>>
  mimeMediaType_not_in?: Maybe<Array<Scalars['String']>>
  mimeMediaType_contains?: Maybe<Scalars['String']>
  mimeMediaType_not_contains?: Maybe<Scalars['String']>
  mimeMediaType_containsInsensitive?: Maybe<Scalars['String']>
  mimeMediaType_not_containsInsensitive?: Maybe<Scalars['String']>
  mimeMediaType_startsWith?: Maybe<Scalars['String']>
  mimeMediaType_not_startsWith?: Maybe<Scalars['String']>
  mimeMediaType_endsWith?: Maybe<Scalars['String']>
  mimeMediaType_not_endsWith?: Maybe<Scalars['String']>
  AND?: Maybe<Array<VideoMediaEncodingWhereInput>>
  OR?: Maybe<Array<VideoMediaEncodingWhereInput>>
}

export type VideoMediaEncodingsConnection = {
  edges: Array<VideoMediaEncodingEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type VideoMediaMetadata = {
  /** Unique identifier */
  id: Scalars['String']
  /** Encoding of the video media object */
  encoding?: Maybe<VideoMediaEncoding>
  /** Video media width in pixels */
  pixelWidth?: Maybe<Scalars['Int']>
  /** Video media height in pixels */
  pixelHeight?: Maybe<Scalars['Int']>
  /** Video media size in bytes */
  size?: Maybe<Scalars['BigInt']>
  video: Video
  createdInBlock: Scalars['Int']
}

export type VideoMediaMetadataConnection = {
  edges: Array<VideoMediaMetadataEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type VideoMediaMetadataEdge = {
  node: VideoMediaMetadata
  cursor: Scalars['String']
}

export enum VideoMediaMetadataOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  EncodingIdAsc = 'encoding_id_ASC',
  EncodingIdDesc = 'encoding_id_DESC',
  EncodingCodecNameAsc = 'encoding_codecName_ASC',
  EncodingCodecNameDesc = 'encoding_codecName_DESC',
  EncodingContainerAsc = 'encoding_container_ASC',
  EncodingContainerDesc = 'encoding_container_DESC',
  EncodingMimeMediaTypeAsc = 'encoding_mimeMediaType_ASC',
  EncodingMimeMediaTypeDesc = 'encoding_mimeMediaType_DESC',
  PixelWidthAsc = 'pixelWidth_ASC',
  PixelWidthDesc = 'pixelWidth_DESC',
  PixelHeightAsc = 'pixelHeight_ASC',
  PixelHeightDesc = 'pixelHeight_DESC',
  SizeAsc = 'size_ASC',
  SizeDesc = 'size_DESC',
  VideoIdAsc = 'video_id_ASC',
  VideoIdDesc = 'video_id_DESC',
  VideoCreatedAtAsc = 'video_createdAt_ASC',
  VideoCreatedAtDesc = 'video_createdAt_DESC',
  VideoTitleAsc = 'video_title_ASC',
  VideoTitleDesc = 'video_title_DESC',
  VideoDescriptionAsc = 'video_description_ASC',
  VideoDescriptionDesc = 'video_description_DESC',
  VideoDurationAsc = 'video_duration_ASC',
  VideoDurationDesc = 'video_duration_DESC',
  VideoLanguageAsc = 'video_language_ASC',
  VideoLanguageDesc = 'video_language_DESC',
  VideoOrionLanguageAsc = 'video_orionLanguage_ASC',
  VideoOrionLanguageDesc = 'video_orionLanguage_DESC',
  VideoHasMarketingAsc = 'video_hasMarketing_ASC',
  VideoHasMarketingDesc = 'video_hasMarketing_DESC',
  VideoPublishedBeforeJoystreamAsc = 'video_publishedBeforeJoystream_ASC',
  VideoPublishedBeforeJoystreamDesc = 'video_publishedBeforeJoystream_DESC',
  VideoIsPublicAsc = 'video_isPublic_ASC',
  VideoIsPublicDesc = 'video_isPublic_DESC',
  VideoIsCensoredAsc = 'video_isCensored_ASC',
  VideoIsCensoredDesc = 'video_isCensored_DESC',
  VideoIsExcludedAsc = 'video_isExcluded_ASC',
  VideoIsExcludedDesc = 'video_isExcluded_DESC',
  VideoIsExplicitAsc = 'video_isExplicit_ASC',
  VideoIsExplicitDesc = 'video_isExplicit_DESC',
  VideoVideoStateBloatBondAsc = 'video_videoStateBloatBond_ASC',
  VideoVideoStateBloatBondDesc = 'video_videoStateBloatBond_DESC',
  VideoCreatedInBlockAsc = 'video_createdInBlock_ASC',
  VideoCreatedInBlockDesc = 'video_createdInBlock_DESC',
  VideoIsCommentSectionEnabledAsc = 'video_isCommentSectionEnabled_ASC',
  VideoIsCommentSectionEnabledDesc = 'video_isCommentSectionEnabled_DESC',
  VideoCommentsCountAsc = 'video_commentsCount_ASC',
  VideoCommentsCountDesc = 'video_commentsCount_DESC',
  VideoIsReactionFeatureEnabledAsc = 'video_isReactionFeatureEnabled_ASC',
  VideoIsReactionFeatureEnabledDesc = 'video_isReactionFeatureEnabled_DESC',
  VideoReactionsCountAsc = 'video_reactionsCount_ASC',
  VideoReactionsCountDesc = 'video_reactionsCount_DESC',
  VideoViewsNumAsc = 'video_viewsNum_ASC',
  VideoViewsNumDesc = 'video_viewsNum_DESC',
  VideoYtVideoIdAsc = 'video_ytVideoId_ASC',
  VideoYtVideoIdDesc = 'video_ytVideoId_DESC',
  VideoVideoRelevanceAsc = 'video_videoRelevance_ASC',
  VideoVideoRelevanceDesc = 'video_videoRelevance_DESC',
  VideoIsShortAsc = 'video_isShort_ASC',
  VideoIsShortDesc = 'video_isShort_DESC',
  VideoIncludeInHomeFeedAsc = 'video_includeInHomeFeed_ASC',
  VideoIncludeInHomeFeedDesc = 'video_includeInHomeFeed_DESC',
  CreatedInBlockAsc = 'createdInBlock_ASC',
  CreatedInBlockDesc = 'createdInBlock_DESC',
}

export type VideoMediaMetadataWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  encoding_isNull?: Maybe<Scalars['Boolean']>
  encoding?: Maybe<VideoMediaEncodingWhereInput>
  pixelWidth_isNull?: Maybe<Scalars['Boolean']>
  pixelWidth_eq?: Maybe<Scalars['Int']>
  pixelWidth_not_eq?: Maybe<Scalars['Int']>
  pixelWidth_gt?: Maybe<Scalars['Int']>
  pixelWidth_gte?: Maybe<Scalars['Int']>
  pixelWidth_lt?: Maybe<Scalars['Int']>
  pixelWidth_lte?: Maybe<Scalars['Int']>
  pixelWidth_in?: Maybe<Array<Scalars['Int']>>
  pixelWidth_not_in?: Maybe<Array<Scalars['Int']>>
  pixelHeight_isNull?: Maybe<Scalars['Boolean']>
  pixelHeight_eq?: Maybe<Scalars['Int']>
  pixelHeight_not_eq?: Maybe<Scalars['Int']>
  pixelHeight_gt?: Maybe<Scalars['Int']>
  pixelHeight_gte?: Maybe<Scalars['Int']>
  pixelHeight_lt?: Maybe<Scalars['Int']>
  pixelHeight_lte?: Maybe<Scalars['Int']>
  pixelHeight_in?: Maybe<Array<Scalars['Int']>>
  pixelHeight_not_in?: Maybe<Array<Scalars['Int']>>
  size_isNull?: Maybe<Scalars['Boolean']>
  size_eq?: Maybe<Scalars['BigInt']>
  size_not_eq?: Maybe<Scalars['BigInt']>
  size_gt?: Maybe<Scalars['BigInt']>
  size_gte?: Maybe<Scalars['BigInt']>
  size_lt?: Maybe<Scalars['BigInt']>
  size_lte?: Maybe<Scalars['BigInt']>
  size_in?: Maybe<Array<Scalars['BigInt']>>
  size_not_in?: Maybe<Array<Scalars['BigInt']>>
  video_isNull?: Maybe<Scalars['Boolean']>
  video?: Maybe<VideoWhereInput>
  createdInBlock_isNull?: Maybe<Scalars['Boolean']>
  createdInBlock_eq?: Maybe<Scalars['Int']>
  createdInBlock_not_eq?: Maybe<Scalars['Int']>
  createdInBlock_gt?: Maybe<Scalars['Int']>
  createdInBlock_gte?: Maybe<Scalars['Int']>
  createdInBlock_lt?: Maybe<Scalars['Int']>
  createdInBlock_lte?: Maybe<Scalars['Int']>
  createdInBlock_in?: Maybe<Array<Scalars['Int']>>
  createdInBlock_not_in?: Maybe<Array<Scalars['Int']>>
  AND?: Maybe<Array<VideoMediaMetadataWhereInput>>
  OR?: Maybe<Array<VideoMediaMetadataWhereInput>>
}

export enum VideoOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  CreatedAtAsc = 'createdAt_ASC',
  CreatedAtDesc = 'createdAt_DESC',
  ChannelIdAsc = 'channel_id_ASC',
  ChannelIdDesc = 'channel_id_DESC',
  ChannelCreatedAtAsc = 'channel_createdAt_ASC',
  ChannelCreatedAtDesc = 'channel_createdAt_DESC',
  ChannelTitleAsc = 'channel_title_ASC',
  ChannelTitleDesc = 'channel_title_DESC',
  ChannelDescriptionAsc = 'channel_description_ASC',
  ChannelDescriptionDesc = 'channel_description_DESC',
  ChannelIsPublicAsc = 'channel_isPublic_ASC',
  ChannelIsPublicDesc = 'channel_isPublic_DESC',
  ChannelIsCensoredAsc = 'channel_isCensored_ASC',
  ChannelIsCensoredDesc = 'channel_isCensored_DESC',
  ChannelIsExcludedAsc = 'channel_isExcluded_ASC',
  ChannelIsExcludedDesc = 'channel_isExcluded_DESC',
  ChannelLanguageAsc = 'channel_language_ASC',
  ChannelLanguageDesc = 'channel_language_DESC',
  ChannelCreatedInBlockAsc = 'channel_createdInBlock_ASC',
  ChannelCreatedInBlockDesc = 'channel_createdInBlock_DESC',
  ChannelRewardAccountAsc = 'channel_rewardAccount_ASC',
  ChannelRewardAccountDesc = 'channel_rewardAccount_DESC',
  ChannelChannelStateBloatBondAsc = 'channel_channelStateBloatBond_ASC',
  ChannelChannelStateBloatBondDesc = 'channel_channelStateBloatBond_DESC',
  ChannelFollowsNumAsc = 'channel_followsNum_ASC',
  ChannelFollowsNumDesc = 'channel_followsNum_DESC',
  ChannelVideoViewsNumAsc = 'channel_videoViewsNum_ASC',
  ChannelVideoViewsNumDesc = 'channel_videoViewsNum_DESC',
  ChannelTotalVideosCreatedAsc = 'channel_totalVideosCreated_ASC',
  ChannelTotalVideosCreatedDesc = 'channel_totalVideosCreated_DESC',
  ChannelCumulativeRewardClaimedAsc = 'channel_cumulativeRewardClaimed_ASC',
  ChannelCumulativeRewardClaimedDesc = 'channel_cumulativeRewardClaimed_DESC',
  ChannelCumulativeRewardAsc = 'channel_cumulativeReward_ASC',
  ChannelCumulativeRewardDesc = 'channel_cumulativeReward_DESC',
  ChannelChannelWeightAsc = 'channel_channelWeight_ASC',
  ChannelChannelWeightDesc = 'channel_channelWeight_DESC',
  CategoryIdAsc = 'category_id_ASC',
  CategoryIdDesc = 'category_id_DESC',
  CategoryNameAsc = 'category_name_ASC',
  CategoryNameDesc = 'category_name_DESC',
  CategoryDescriptionAsc = 'category_description_ASC',
  CategoryDescriptionDesc = 'category_description_DESC',
  CategoryIsSupportedAsc = 'category_isSupported_ASC',
  CategoryIsSupportedDesc = 'category_isSupported_DESC',
  CategoryCreatedInBlockAsc = 'category_createdInBlock_ASC',
  CategoryCreatedInBlockDesc = 'category_createdInBlock_DESC',
  TitleAsc = 'title_ASC',
  TitleDesc = 'title_DESC',
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC',
  DurationAsc = 'duration_ASC',
  DurationDesc = 'duration_DESC',
  ThumbnailPhotoIdAsc = 'thumbnailPhoto_id_ASC',
  ThumbnailPhotoIdDesc = 'thumbnailPhoto_id_DESC',
  ThumbnailPhotoCreatedAtAsc = 'thumbnailPhoto_createdAt_ASC',
  ThumbnailPhotoCreatedAtDesc = 'thumbnailPhoto_createdAt_DESC',
  ThumbnailPhotoIsAcceptedAsc = 'thumbnailPhoto_isAccepted_ASC',
  ThumbnailPhotoIsAcceptedDesc = 'thumbnailPhoto_isAccepted_DESC',
  ThumbnailPhotoSizeAsc = 'thumbnailPhoto_size_ASC',
  ThumbnailPhotoSizeDesc = 'thumbnailPhoto_size_DESC',
  ThumbnailPhotoIpfsHashAsc = 'thumbnailPhoto_ipfsHash_ASC',
  ThumbnailPhotoIpfsHashDesc = 'thumbnailPhoto_ipfsHash_DESC',
  ThumbnailPhotoStateBloatBondAsc = 'thumbnailPhoto_stateBloatBond_ASC',
  ThumbnailPhotoStateBloatBondDesc = 'thumbnailPhoto_stateBloatBond_DESC',
  ThumbnailPhotoUnsetAtAsc = 'thumbnailPhoto_unsetAt_ASC',
  ThumbnailPhotoUnsetAtDesc = 'thumbnailPhoto_unsetAt_DESC',
  LanguageAsc = 'language_ASC',
  LanguageDesc = 'language_DESC',
  OrionLanguageAsc = 'orionLanguage_ASC',
  OrionLanguageDesc = 'orionLanguage_DESC',
  HasMarketingAsc = 'hasMarketing_ASC',
  HasMarketingDesc = 'hasMarketing_DESC',
  PublishedBeforeJoystreamAsc = 'publishedBeforeJoystream_ASC',
  PublishedBeforeJoystreamDesc = 'publishedBeforeJoystream_DESC',
  IsPublicAsc = 'isPublic_ASC',
  IsPublicDesc = 'isPublic_DESC',
  IsCensoredAsc = 'isCensored_ASC',
  IsCensoredDesc = 'isCensored_DESC',
  IsExcludedAsc = 'isExcluded_ASC',
  IsExcludedDesc = 'isExcluded_DESC',
  NftIdAsc = 'nft_id_ASC',
  NftIdDesc = 'nft_id_DESC',
  NftCreatedAtAsc = 'nft_createdAt_ASC',
  NftCreatedAtDesc = 'nft_createdAt_DESC',
  NftCreatorRoyaltyAsc = 'nft_creatorRoyalty_ASC',
  NftCreatorRoyaltyDesc = 'nft_creatorRoyalty_DESC',
  NftLastSalePriceAsc = 'nft_lastSalePrice_ASC',
  NftLastSalePriceDesc = 'nft_lastSalePrice_DESC',
  NftLastSaleDateAsc = 'nft_lastSaleDate_ASC',
  NftLastSaleDateDesc = 'nft_lastSaleDate_DESC',
  NftIsFeaturedAsc = 'nft_isFeatured_ASC',
  NftIsFeaturedDesc = 'nft_isFeatured_DESC',
  IsExplicitAsc = 'isExplicit_ASC',
  IsExplicitDesc = 'isExplicit_DESC',
  LicenseIdAsc = 'license_id_ASC',
  LicenseIdDesc = 'license_id_DESC',
  LicenseCodeAsc = 'license_code_ASC',
  LicenseCodeDesc = 'license_code_DESC',
  LicenseAttributionAsc = 'license_attribution_ASC',
  LicenseAttributionDesc = 'license_attribution_DESC',
  LicenseCustomTextAsc = 'license_customText_ASC',
  LicenseCustomTextDesc = 'license_customText_DESC',
  MediaIdAsc = 'media_id_ASC',
  MediaIdDesc = 'media_id_DESC',
  MediaCreatedAtAsc = 'media_createdAt_ASC',
  MediaCreatedAtDesc = 'media_createdAt_DESC',
  MediaIsAcceptedAsc = 'media_isAccepted_ASC',
  MediaIsAcceptedDesc = 'media_isAccepted_DESC',
  MediaSizeAsc = 'media_size_ASC',
  MediaSizeDesc = 'media_size_DESC',
  MediaIpfsHashAsc = 'media_ipfsHash_ASC',
  MediaIpfsHashDesc = 'media_ipfsHash_DESC',
  MediaStateBloatBondAsc = 'media_stateBloatBond_ASC',
  MediaStateBloatBondDesc = 'media_stateBloatBond_DESC',
  MediaUnsetAtAsc = 'media_unsetAt_ASC',
  MediaUnsetAtDesc = 'media_unsetAt_DESC',
  VideoStateBloatBondAsc = 'videoStateBloatBond_ASC',
  VideoStateBloatBondDesc = 'videoStateBloatBond_DESC',
  MediaMetadataIdAsc = 'mediaMetadata_id_ASC',
  MediaMetadataIdDesc = 'mediaMetadata_id_DESC',
  MediaMetadataPixelWidthAsc = 'mediaMetadata_pixelWidth_ASC',
  MediaMetadataPixelWidthDesc = 'mediaMetadata_pixelWidth_DESC',
  MediaMetadataPixelHeightAsc = 'mediaMetadata_pixelHeight_ASC',
  MediaMetadataPixelHeightDesc = 'mediaMetadata_pixelHeight_DESC',
  MediaMetadataSizeAsc = 'mediaMetadata_size_ASC',
  MediaMetadataSizeDesc = 'mediaMetadata_size_DESC',
  MediaMetadataCreatedInBlockAsc = 'mediaMetadata_createdInBlock_ASC',
  MediaMetadataCreatedInBlockDesc = 'mediaMetadata_createdInBlock_DESC',
  CreatedInBlockAsc = 'createdInBlock_ASC',
  CreatedInBlockDesc = 'createdInBlock_DESC',
  IsCommentSectionEnabledAsc = 'isCommentSectionEnabled_ASC',
  IsCommentSectionEnabledDesc = 'isCommentSectionEnabled_DESC',
  PinnedCommentIdAsc = 'pinnedComment_id_ASC',
  PinnedCommentIdDesc = 'pinnedComment_id_DESC',
  PinnedCommentCreatedAtAsc = 'pinnedComment_createdAt_ASC',
  PinnedCommentCreatedAtDesc = 'pinnedComment_createdAt_DESC',
  PinnedCommentTextAsc = 'pinnedComment_text_ASC',
  PinnedCommentTextDesc = 'pinnedComment_text_DESC',
  PinnedCommentStatusAsc = 'pinnedComment_status_ASC',
  PinnedCommentStatusDesc = 'pinnedComment_status_DESC',
  PinnedCommentRepliesCountAsc = 'pinnedComment_repliesCount_ASC',
  PinnedCommentRepliesCountDesc = 'pinnedComment_repliesCount_DESC',
  PinnedCommentReactionsCountAsc = 'pinnedComment_reactionsCount_ASC',
  PinnedCommentReactionsCountDesc = 'pinnedComment_reactionsCount_DESC',
  PinnedCommentReactionsAndRepliesCountAsc = 'pinnedComment_reactionsAndRepliesCount_ASC',
  PinnedCommentReactionsAndRepliesCountDesc = 'pinnedComment_reactionsAndRepliesCount_DESC',
  PinnedCommentIsEditedAsc = 'pinnedComment_isEdited_ASC',
  PinnedCommentIsEditedDesc = 'pinnedComment_isEdited_DESC',
  PinnedCommentIsExcludedAsc = 'pinnedComment_isExcluded_ASC',
  PinnedCommentIsExcludedDesc = 'pinnedComment_isExcluded_DESC',
  CommentsCountAsc = 'commentsCount_ASC',
  CommentsCountDesc = 'commentsCount_DESC',
  IsReactionFeatureEnabledAsc = 'isReactionFeatureEnabled_ASC',
  IsReactionFeatureEnabledDesc = 'isReactionFeatureEnabled_DESC',
  ReactionsCountAsc = 'reactionsCount_ASC',
  ReactionsCountDesc = 'reactionsCount_DESC',
  ViewsNumAsc = 'viewsNum_ASC',
  ViewsNumDesc = 'viewsNum_DESC',
  EntryAppIdAsc = 'entryApp_id_ASC',
  EntryAppIdDesc = 'entryApp_id_DESC',
  EntryAppNameAsc = 'entryApp_name_ASC',
  EntryAppNameDesc = 'entryApp_name_DESC',
  EntryAppWebsiteUrlAsc = 'entryApp_websiteUrl_ASC',
  EntryAppWebsiteUrlDesc = 'entryApp_websiteUrl_DESC',
  EntryAppUseUriAsc = 'entryApp_useUri_ASC',
  EntryAppUseUriDesc = 'entryApp_useUri_DESC',
  EntryAppSmallIconAsc = 'entryApp_smallIcon_ASC',
  EntryAppSmallIconDesc = 'entryApp_smallIcon_DESC',
  EntryAppMediumIconAsc = 'entryApp_mediumIcon_ASC',
  EntryAppMediumIconDesc = 'entryApp_mediumIcon_DESC',
  EntryAppBigIconAsc = 'entryApp_bigIcon_ASC',
  EntryAppBigIconDesc = 'entryApp_bigIcon_DESC',
  EntryAppOneLinerAsc = 'entryApp_oneLiner_ASC',
  EntryAppOneLinerDesc = 'entryApp_oneLiner_DESC',
  EntryAppDescriptionAsc = 'entryApp_description_ASC',
  EntryAppDescriptionDesc = 'entryApp_description_DESC',
  EntryAppTermsOfServiceAsc = 'entryApp_termsOfService_ASC',
  EntryAppTermsOfServiceDesc = 'entryApp_termsOfService_DESC',
  EntryAppCategoryAsc = 'entryApp_category_ASC',
  EntryAppCategoryDesc = 'entryApp_category_DESC',
  EntryAppAuthKeyAsc = 'entryApp_authKey_ASC',
  EntryAppAuthKeyDesc = 'entryApp_authKey_DESC',
  YtVideoIdAsc = 'ytVideoId_ASC',
  YtVideoIdDesc = 'ytVideoId_DESC',
  VideoRelevanceAsc = 'videoRelevance_ASC',
  VideoRelevanceDesc = 'videoRelevance_DESC',
  IsShortAsc = 'isShort_ASC',
  IsShortDesc = 'isShort_DESC',
  IncludeInHomeFeedAsc = 'includeInHomeFeed_ASC',
  IncludeInHomeFeedDesc = 'includeInHomeFeed_DESC',
}

export type VideoPosted = {
  /** video title for notification text */
  videoTitle: Scalars['String']
  /** channel title for notification text */
  channelTitle: Scalars['String']
  /** id for the channel used in link construction */
  channelId: Scalars['String']
  /** video Id used for link */
  videoId: Scalars['String']
}

export type VideoReaction = {
  /** {memberId}-{videoId} */
  id: Scalars['String']
  /** Timestamp of the block the reaction was created at */
  createdAt: Scalars['DateTime']
  /** The Reaction */
  reaction: VideoReactionOptions
  /** The member that reacted */
  member: Membership
  /** The video that has been reacted to */
  video: Video
}

export type VideoReactionEdge = {
  node: VideoReaction
  cursor: Scalars['String']
}

export type VideoReactionEventData = {
  /** video reaction reference */
  videoReaction: VideoReaction
}

export enum VideoReactionOptions {
  Like = 'LIKE',
  Unlike = 'UNLIKE',
}

export enum VideoReactionOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  CreatedAtAsc = 'createdAt_ASC',
  CreatedAtDesc = 'createdAt_DESC',
  ReactionAsc = 'reaction_ASC',
  ReactionDesc = 'reaction_DESC',
  MemberIdAsc = 'member_id_ASC',
  MemberIdDesc = 'member_id_DESC',
  MemberCreatedAtAsc = 'member_createdAt_ASC',
  MemberCreatedAtDesc = 'member_createdAt_DESC',
  MemberHandleAsc = 'member_handle_ASC',
  MemberHandleDesc = 'member_handle_DESC',
  MemberHandleRawAsc = 'member_handleRaw_ASC',
  MemberHandleRawDesc = 'member_handleRaw_DESC',
  MemberControllerAccountAsc = 'member_controllerAccount_ASC',
  MemberControllerAccountDesc = 'member_controllerAccount_DESC',
  MemberTotalChannelsCreatedAsc = 'member_totalChannelsCreated_ASC',
  MemberTotalChannelsCreatedDesc = 'member_totalChannelsCreated_DESC',
  VideoIdAsc = 'video_id_ASC',
  VideoIdDesc = 'video_id_DESC',
  VideoCreatedAtAsc = 'video_createdAt_ASC',
  VideoCreatedAtDesc = 'video_createdAt_DESC',
  VideoTitleAsc = 'video_title_ASC',
  VideoTitleDesc = 'video_title_DESC',
  VideoDescriptionAsc = 'video_description_ASC',
  VideoDescriptionDesc = 'video_description_DESC',
  VideoDurationAsc = 'video_duration_ASC',
  VideoDurationDesc = 'video_duration_DESC',
  VideoLanguageAsc = 'video_language_ASC',
  VideoLanguageDesc = 'video_language_DESC',
  VideoOrionLanguageAsc = 'video_orionLanguage_ASC',
  VideoOrionLanguageDesc = 'video_orionLanguage_DESC',
  VideoHasMarketingAsc = 'video_hasMarketing_ASC',
  VideoHasMarketingDesc = 'video_hasMarketing_DESC',
  VideoPublishedBeforeJoystreamAsc = 'video_publishedBeforeJoystream_ASC',
  VideoPublishedBeforeJoystreamDesc = 'video_publishedBeforeJoystream_DESC',
  VideoIsPublicAsc = 'video_isPublic_ASC',
  VideoIsPublicDesc = 'video_isPublic_DESC',
  VideoIsCensoredAsc = 'video_isCensored_ASC',
  VideoIsCensoredDesc = 'video_isCensored_DESC',
  VideoIsExcludedAsc = 'video_isExcluded_ASC',
  VideoIsExcludedDesc = 'video_isExcluded_DESC',
  VideoIsExplicitAsc = 'video_isExplicit_ASC',
  VideoIsExplicitDesc = 'video_isExplicit_DESC',
  VideoVideoStateBloatBondAsc = 'video_videoStateBloatBond_ASC',
  VideoVideoStateBloatBondDesc = 'video_videoStateBloatBond_DESC',
  VideoCreatedInBlockAsc = 'video_createdInBlock_ASC',
  VideoCreatedInBlockDesc = 'video_createdInBlock_DESC',
  VideoIsCommentSectionEnabledAsc = 'video_isCommentSectionEnabled_ASC',
  VideoIsCommentSectionEnabledDesc = 'video_isCommentSectionEnabled_DESC',
  VideoCommentsCountAsc = 'video_commentsCount_ASC',
  VideoCommentsCountDesc = 'video_commentsCount_DESC',
  VideoIsReactionFeatureEnabledAsc = 'video_isReactionFeatureEnabled_ASC',
  VideoIsReactionFeatureEnabledDesc = 'video_isReactionFeatureEnabled_DESC',
  VideoReactionsCountAsc = 'video_reactionsCount_ASC',
  VideoReactionsCountDesc = 'video_reactionsCount_DESC',
  VideoViewsNumAsc = 'video_viewsNum_ASC',
  VideoViewsNumDesc = 'video_viewsNum_DESC',
  VideoYtVideoIdAsc = 'video_ytVideoId_ASC',
  VideoYtVideoIdDesc = 'video_ytVideoId_DESC',
  VideoVideoRelevanceAsc = 'video_videoRelevance_ASC',
  VideoVideoRelevanceDesc = 'video_videoRelevance_DESC',
  VideoIsShortAsc = 'video_isShort_ASC',
  VideoIsShortDesc = 'video_isShort_DESC',
  VideoIncludeInHomeFeedAsc = 'video_includeInHomeFeed_ASC',
  VideoIncludeInHomeFeedDesc = 'video_includeInHomeFeed_DESC',
}

export type VideoReactionWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  createdAt_isNull?: Maybe<Scalars['Boolean']>
  createdAt_eq?: Maybe<Scalars['DateTime']>
  createdAt_not_eq?: Maybe<Scalars['DateTime']>
  createdAt_gt?: Maybe<Scalars['DateTime']>
  createdAt_gte?: Maybe<Scalars['DateTime']>
  createdAt_lt?: Maybe<Scalars['DateTime']>
  createdAt_lte?: Maybe<Scalars['DateTime']>
  createdAt_in?: Maybe<Array<Scalars['DateTime']>>
  createdAt_not_in?: Maybe<Array<Scalars['DateTime']>>
  reaction_isNull?: Maybe<Scalars['Boolean']>
  reaction_eq?: Maybe<VideoReactionOptions>
  reaction_not_eq?: Maybe<VideoReactionOptions>
  reaction_in?: Maybe<Array<VideoReactionOptions>>
  reaction_not_in?: Maybe<Array<VideoReactionOptions>>
  member_isNull?: Maybe<Scalars['Boolean']>
  member?: Maybe<MembershipWhereInput>
  video_isNull?: Maybe<Scalars['Boolean']>
  video?: Maybe<VideoWhereInput>
  AND?: Maybe<Array<VideoReactionWhereInput>>
  OR?: Maybe<Array<VideoReactionWhereInput>>
}

export type VideoReactionsConnection = {
  edges: Array<VideoReactionEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type VideoReactionsCountByReactionType = {
  /** The reaction option */
  reaction: VideoReactionOptions
  /** No of times the video has been reacted with given reaction */
  count: Scalars['Int']
}

export type VideoReportInfo = {
  id: Scalars['String']
  rationale: Scalars['String']
  createdAt: Scalars['DateTime']
  created: Scalars['Boolean']
  videoId: Scalars['String']
}

export type VideoSubtitle = {
  /** {type}-{language} */
  id: Scalars['String']
  /** Subtitle's video */
  video: Video
  /** Subtitle's type */
  type: Scalars['String']
  /** Subtitle's language */
  language?: Maybe<Scalars['String']>
  /** MIME type description of format used for this subtitle */
  mimeType: Scalars['String']
  /** Storage object representing the subtitle file */
  asset?: Maybe<StorageDataObject>
}

export type VideoSubtitleEdge = {
  node: VideoSubtitle
  cursor: Scalars['String']
}

export enum VideoSubtitleOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  VideoIdAsc = 'video_id_ASC',
  VideoIdDesc = 'video_id_DESC',
  VideoCreatedAtAsc = 'video_createdAt_ASC',
  VideoCreatedAtDesc = 'video_createdAt_DESC',
  VideoTitleAsc = 'video_title_ASC',
  VideoTitleDesc = 'video_title_DESC',
  VideoDescriptionAsc = 'video_description_ASC',
  VideoDescriptionDesc = 'video_description_DESC',
  VideoDurationAsc = 'video_duration_ASC',
  VideoDurationDesc = 'video_duration_DESC',
  VideoLanguageAsc = 'video_language_ASC',
  VideoLanguageDesc = 'video_language_DESC',
  VideoOrionLanguageAsc = 'video_orionLanguage_ASC',
  VideoOrionLanguageDesc = 'video_orionLanguage_DESC',
  VideoHasMarketingAsc = 'video_hasMarketing_ASC',
  VideoHasMarketingDesc = 'video_hasMarketing_DESC',
  VideoPublishedBeforeJoystreamAsc = 'video_publishedBeforeJoystream_ASC',
  VideoPublishedBeforeJoystreamDesc = 'video_publishedBeforeJoystream_DESC',
  VideoIsPublicAsc = 'video_isPublic_ASC',
  VideoIsPublicDesc = 'video_isPublic_DESC',
  VideoIsCensoredAsc = 'video_isCensored_ASC',
  VideoIsCensoredDesc = 'video_isCensored_DESC',
  VideoIsExcludedAsc = 'video_isExcluded_ASC',
  VideoIsExcludedDesc = 'video_isExcluded_DESC',
  VideoIsExplicitAsc = 'video_isExplicit_ASC',
  VideoIsExplicitDesc = 'video_isExplicit_DESC',
  VideoVideoStateBloatBondAsc = 'video_videoStateBloatBond_ASC',
  VideoVideoStateBloatBondDesc = 'video_videoStateBloatBond_DESC',
  VideoCreatedInBlockAsc = 'video_createdInBlock_ASC',
  VideoCreatedInBlockDesc = 'video_createdInBlock_DESC',
  VideoIsCommentSectionEnabledAsc = 'video_isCommentSectionEnabled_ASC',
  VideoIsCommentSectionEnabledDesc = 'video_isCommentSectionEnabled_DESC',
  VideoCommentsCountAsc = 'video_commentsCount_ASC',
  VideoCommentsCountDesc = 'video_commentsCount_DESC',
  VideoIsReactionFeatureEnabledAsc = 'video_isReactionFeatureEnabled_ASC',
  VideoIsReactionFeatureEnabledDesc = 'video_isReactionFeatureEnabled_DESC',
  VideoReactionsCountAsc = 'video_reactionsCount_ASC',
  VideoReactionsCountDesc = 'video_reactionsCount_DESC',
  VideoViewsNumAsc = 'video_viewsNum_ASC',
  VideoViewsNumDesc = 'video_viewsNum_DESC',
  VideoYtVideoIdAsc = 'video_ytVideoId_ASC',
  VideoYtVideoIdDesc = 'video_ytVideoId_DESC',
  VideoVideoRelevanceAsc = 'video_videoRelevance_ASC',
  VideoVideoRelevanceDesc = 'video_videoRelevance_DESC',
  VideoIsShortAsc = 'video_isShort_ASC',
  VideoIsShortDesc = 'video_isShort_DESC',
  VideoIncludeInHomeFeedAsc = 'video_includeInHomeFeed_ASC',
  VideoIncludeInHomeFeedDesc = 'video_includeInHomeFeed_DESC',
  TypeAsc = 'type_ASC',
  TypeDesc = 'type_DESC',
  LanguageAsc = 'language_ASC',
  LanguageDesc = 'language_DESC',
  MimeTypeAsc = 'mimeType_ASC',
  MimeTypeDesc = 'mimeType_DESC',
  AssetIdAsc = 'asset_id_ASC',
  AssetIdDesc = 'asset_id_DESC',
  AssetCreatedAtAsc = 'asset_createdAt_ASC',
  AssetCreatedAtDesc = 'asset_createdAt_DESC',
  AssetIsAcceptedAsc = 'asset_isAccepted_ASC',
  AssetIsAcceptedDesc = 'asset_isAccepted_DESC',
  AssetSizeAsc = 'asset_size_ASC',
  AssetSizeDesc = 'asset_size_DESC',
  AssetIpfsHashAsc = 'asset_ipfsHash_ASC',
  AssetIpfsHashDesc = 'asset_ipfsHash_DESC',
  AssetStateBloatBondAsc = 'asset_stateBloatBond_ASC',
  AssetStateBloatBondDesc = 'asset_stateBloatBond_DESC',
  AssetUnsetAtAsc = 'asset_unsetAt_ASC',
  AssetUnsetAtDesc = 'asset_unsetAt_DESC',
}

export type VideoSubtitleWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  video_isNull?: Maybe<Scalars['Boolean']>
  video?: Maybe<VideoWhereInput>
  type_isNull?: Maybe<Scalars['Boolean']>
  type_eq?: Maybe<Scalars['String']>
  type_not_eq?: Maybe<Scalars['String']>
  type_gt?: Maybe<Scalars['String']>
  type_gte?: Maybe<Scalars['String']>
  type_lt?: Maybe<Scalars['String']>
  type_lte?: Maybe<Scalars['String']>
  type_in?: Maybe<Array<Scalars['String']>>
  type_not_in?: Maybe<Array<Scalars['String']>>
  type_contains?: Maybe<Scalars['String']>
  type_not_contains?: Maybe<Scalars['String']>
  type_containsInsensitive?: Maybe<Scalars['String']>
  type_not_containsInsensitive?: Maybe<Scalars['String']>
  type_startsWith?: Maybe<Scalars['String']>
  type_not_startsWith?: Maybe<Scalars['String']>
  type_endsWith?: Maybe<Scalars['String']>
  type_not_endsWith?: Maybe<Scalars['String']>
  language_isNull?: Maybe<Scalars['Boolean']>
  language_eq?: Maybe<Scalars['String']>
  language_not_eq?: Maybe<Scalars['String']>
  language_gt?: Maybe<Scalars['String']>
  language_gte?: Maybe<Scalars['String']>
  language_lt?: Maybe<Scalars['String']>
  language_lte?: Maybe<Scalars['String']>
  language_in?: Maybe<Array<Scalars['String']>>
  language_not_in?: Maybe<Array<Scalars['String']>>
  language_contains?: Maybe<Scalars['String']>
  language_not_contains?: Maybe<Scalars['String']>
  language_containsInsensitive?: Maybe<Scalars['String']>
  language_not_containsInsensitive?: Maybe<Scalars['String']>
  language_startsWith?: Maybe<Scalars['String']>
  language_not_startsWith?: Maybe<Scalars['String']>
  language_endsWith?: Maybe<Scalars['String']>
  language_not_endsWith?: Maybe<Scalars['String']>
  mimeType_isNull?: Maybe<Scalars['Boolean']>
  mimeType_eq?: Maybe<Scalars['String']>
  mimeType_not_eq?: Maybe<Scalars['String']>
  mimeType_gt?: Maybe<Scalars['String']>
  mimeType_gte?: Maybe<Scalars['String']>
  mimeType_lt?: Maybe<Scalars['String']>
  mimeType_lte?: Maybe<Scalars['String']>
  mimeType_in?: Maybe<Array<Scalars['String']>>
  mimeType_not_in?: Maybe<Array<Scalars['String']>>
  mimeType_contains?: Maybe<Scalars['String']>
  mimeType_not_contains?: Maybe<Scalars['String']>
  mimeType_containsInsensitive?: Maybe<Scalars['String']>
  mimeType_not_containsInsensitive?: Maybe<Scalars['String']>
  mimeType_startsWith?: Maybe<Scalars['String']>
  mimeType_not_startsWith?: Maybe<Scalars['String']>
  mimeType_endsWith?: Maybe<Scalars['String']>
  mimeType_not_endsWith?: Maybe<Scalars['String']>
  asset_isNull?: Maybe<Scalars['Boolean']>
  asset?: Maybe<StorageDataObjectWhereInput>
  AND?: Maybe<Array<VideoSubtitleWhereInput>>
  OR?: Maybe<Array<VideoSubtitleWhereInput>>
}

export type VideoSubtitlesConnection = {
  edges: Array<VideoSubtitleEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type VideoViewEvent = {
  /** Unique identifier of the video view event */
  id: Scalars['String']
  /** ID of the video that was viewed (the video may no longer exist) */
  videoId: Scalars['String']
  /** User that viewed the video */
  user: User
  /** Video view event timestamp */
  timestamp: Scalars['DateTime']
}

export type VideoViewEventEdge = {
  node: VideoViewEvent
  cursor: Scalars['String']
}

export enum VideoViewEventOrderByInput {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  VideoIdAsc = 'videoId_ASC',
  VideoIdDesc = 'videoId_DESC',
  UserIdAsc = 'user_id_ASC',
  UserIdDesc = 'user_id_DESC',
  UserIsRootAsc = 'user_isRoot_ASC',
  UserIsRootDesc = 'user_isRoot_DESC',
  TimestampAsc = 'timestamp_ASC',
  TimestampDesc = 'timestamp_DESC',
}

export type VideoViewEventWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  videoId_isNull?: Maybe<Scalars['Boolean']>
  videoId_eq?: Maybe<Scalars['String']>
  videoId_not_eq?: Maybe<Scalars['String']>
  videoId_gt?: Maybe<Scalars['String']>
  videoId_gte?: Maybe<Scalars['String']>
  videoId_lt?: Maybe<Scalars['String']>
  videoId_lte?: Maybe<Scalars['String']>
  videoId_in?: Maybe<Array<Scalars['String']>>
  videoId_not_in?: Maybe<Array<Scalars['String']>>
  videoId_contains?: Maybe<Scalars['String']>
  videoId_not_contains?: Maybe<Scalars['String']>
  videoId_containsInsensitive?: Maybe<Scalars['String']>
  videoId_not_containsInsensitive?: Maybe<Scalars['String']>
  videoId_startsWith?: Maybe<Scalars['String']>
  videoId_not_startsWith?: Maybe<Scalars['String']>
  videoId_endsWith?: Maybe<Scalars['String']>
  videoId_not_endsWith?: Maybe<Scalars['String']>
  user_isNull?: Maybe<Scalars['Boolean']>
  user?: Maybe<UserWhereInput>
  timestamp_isNull?: Maybe<Scalars['Boolean']>
  timestamp_eq?: Maybe<Scalars['DateTime']>
  timestamp_not_eq?: Maybe<Scalars['DateTime']>
  timestamp_gt?: Maybe<Scalars['DateTime']>
  timestamp_gte?: Maybe<Scalars['DateTime']>
  timestamp_lt?: Maybe<Scalars['DateTime']>
  timestamp_lte?: Maybe<Scalars['DateTime']>
  timestamp_in?: Maybe<Array<Scalars['DateTime']>>
  timestamp_not_in?: Maybe<Array<Scalars['DateTime']>>
  AND?: Maybe<Array<VideoViewEventWhereInput>>
  OR?: Maybe<Array<VideoViewEventWhereInput>>
}

export type VideoViewEventsConnection = {
  edges: Array<VideoViewEventEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type VideoViewPerUserTimeLimit = {
  limitInSeconds: Scalars['Int']
}

export type VideoWeights = {
  isApplied: Scalars['Boolean']
}

export type VideoWhereInput = {
  id_isNull?: Maybe<Scalars['Boolean']>
  id_eq?: Maybe<Scalars['String']>
  id_not_eq?: Maybe<Scalars['String']>
  id_gt?: Maybe<Scalars['String']>
  id_gte?: Maybe<Scalars['String']>
  id_lt?: Maybe<Scalars['String']>
  id_lte?: Maybe<Scalars['String']>
  id_in?: Maybe<Array<Scalars['String']>>
  id_not_in?: Maybe<Array<Scalars['String']>>
  id_contains?: Maybe<Scalars['String']>
  id_not_contains?: Maybe<Scalars['String']>
  id_containsInsensitive?: Maybe<Scalars['String']>
  id_not_containsInsensitive?: Maybe<Scalars['String']>
  id_startsWith?: Maybe<Scalars['String']>
  id_not_startsWith?: Maybe<Scalars['String']>
  id_endsWith?: Maybe<Scalars['String']>
  id_not_endsWith?: Maybe<Scalars['String']>
  createdAt_isNull?: Maybe<Scalars['Boolean']>
  createdAt_eq?: Maybe<Scalars['DateTime']>
  createdAt_not_eq?: Maybe<Scalars['DateTime']>
  createdAt_gt?: Maybe<Scalars['DateTime']>
  createdAt_gte?: Maybe<Scalars['DateTime']>
  createdAt_lt?: Maybe<Scalars['DateTime']>
  createdAt_lte?: Maybe<Scalars['DateTime']>
  createdAt_in?: Maybe<Array<Scalars['DateTime']>>
  createdAt_not_in?: Maybe<Array<Scalars['DateTime']>>
  channel_isNull?: Maybe<Scalars['Boolean']>
  channel?: Maybe<ChannelWhereInput>
  category_isNull?: Maybe<Scalars['Boolean']>
  category?: Maybe<VideoCategoryWhereInput>
  title_isNull?: Maybe<Scalars['Boolean']>
  title_eq?: Maybe<Scalars['String']>
  title_not_eq?: Maybe<Scalars['String']>
  title_gt?: Maybe<Scalars['String']>
  title_gte?: Maybe<Scalars['String']>
  title_lt?: Maybe<Scalars['String']>
  title_lte?: Maybe<Scalars['String']>
  title_in?: Maybe<Array<Scalars['String']>>
  title_not_in?: Maybe<Array<Scalars['String']>>
  title_contains?: Maybe<Scalars['String']>
  title_not_contains?: Maybe<Scalars['String']>
  title_containsInsensitive?: Maybe<Scalars['String']>
  title_not_containsInsensitive?: Maybe<Scalars['String']>
  title_startsWith?: Maybe<Scalars['String']>
  title_not_startsWith?: Maybe<Scalars['String']>
  title_endsWith?: Maybe<Scalars['String']>
  title_not_endsWith?: Maybe<Scalars['String']>
  description_isNull?: Maybe<Scalars['Boolean']>
  description_eq?: Maybe<Scalars['String']>
  description_not_eq?: Maybe<Scalars['String']>
  description_gt?: Maybe<Scalars['String']>
  description_gte?: Maybe<Scalars['String']>
  description_lt?: Maybe<Scalars['String']>
  description_lte?: Maybe<Scalars['String']>
  description_in?: Maybe<Array<Scalars['String']>>
  description_not_in?: Maybe<Array<Scalars['String']>>
  description_contains?: Maybe<Scalars['String']>
  description_not_contains?: Maybe<Scalars['String']>
  description_containsInsensitive?: Maybe<Scalars['String']>
  description_not_containsInsensitive?: Maybe<Scalars['String']>
  description_startsWith?: Maybe<Scalars['String']>
  description_not_startsWith?: Maybe<Scalars['String']>
  description_endsWith?: Maybe<Scalars['String']>
  description_not_endsWith?: Maybe<Scalars['String']>
  duration_isNull?: Maybe<Scalars['Boolean']>
  duration_eq?: Maybe<Scalars['Int']>
  duration_not_eq?: Maybe<Scalars['Int']>
  duration_gt?: Maybe<Scalars['Int']>
  duration_gte?: Maybe<Scalars['Int']>
  duration_lt?: Maybe<Scalars['Int']>
  duration_lte?: Maybe<Scalars['Int']>
  duration_in?: Maybe<Array<Scalars['Int']>>
  duration_not_in?: Maybe<Array<Scalars['Int']>>
  thumbnailPhoto_isNull?: Maybe<Scalars['Boolean']>
  thumbnailPhoto?: Maybe<StorageDataObjectWhereInput>
  language_isNull?: Maybe<Scalars['Boolean']>
  language_eq?: Maybe<Scalars['String']>
  language_not_eq?: Maybe<Scalars['String']>
  language_gt?: Maybe<Scalars['String']>
  language_gte?: Maybe<Scalars['String']>
  language_lt?: Maybe<Scalars['String']>
  language_lte?: Maybe<Scalars['String']>
  language_in?: Maybe<Array<Scalars['String']>>
  language_not_in?: Maybe<Array<Scalars['String']>>
  language_contains?: Maybe<Scalars['String']>
  language_not_contains?: Maybe<Scalars['String']>
  language_containsInsensitive?: Maybe<Scalars['String']>
  language_not_containsInsensitive?: Maybe<Scalars['String']>
  language_startsWith?: Maybe<Scalars['String']>
  language_not_startsWith?: Maybe<Scalars['String']>
  language_endsWith?: Maybe<Scalars['String']>
  language_not_endsWith?: Maybe<Scalars['String']>
  orionLanguage_isNull?: Maybe<Scalars['Boolean']>
  orionLanguage_eq?: Maybe<Scalars['String']>
  orionLanguage_not_eq?: Maybe<Scalars['String']>
  orionLanguage_gt?: Maybe<Scalars['String']>
  orionLanguage_gte?: Maybe<Scalars['String']>
  orionLanguage_lt?: Maybe<Scalars['String']>
  orionLanguage_lte?: Maybe<Scalars['String']>
  orionLanguage_in?: Maybe<Array<Scalars['String']>>
  orionLanguage_not_in?: Maybe<Array<Scalars['String']>>
  orionLanguage_contains?: Maybe<Scalars['String']>
  orionLanguage_not_contains?: Maybe<Scalars['String']>
  orionLanguage_containsInsensitive?: Maybe<Scalars['String']>
  orionLanguage_not_containsInsensitive?: Maybe<Scalars['String']>
  orionLanguage_startsWith?: Maybe<Scalars['String']>
  orionLanguage_not_startsWith?: Maybe<Scalars['String']>
  orionLanguage_endsWith?: Maybe<Scalars['String']>
  orionLanguage_not_endsWith?: Maybe<Scalars['String']>
  hasMarketing_isNull?: Maybe<Scalars['Boolean']>
  hasMarketing_eq?: Maybe<Scalars['Boolean']>
  hasMarketing_not_eq?: Maybe<Scalars['Boolean']>
  publishedBeforeJoystream_isNull?: Maybe<Scalars['Boolean']>
  publishedBeforeJoystream_eq?: Maybe<Scalars['DateTime']>
  publishedBeforeJoystream_not_eq?: Maybe<Scalars['DateTime']>
  publishedBeforeJoystream_gt?: Maybe<Scalars['DateTime']>
  publishedBeforeJoystream_gte?: Maybe<Scalars['DateTime']>
  publishedBeforeJoystream_lt?: Maybe<Scalars['DateTime']>
  publishedBeforeJoystream_lte?: Maybe<Scalars['DateTime']>
  publishedBeforeJoystream_in?: Maybe<Array<Scalars['DateTime']>>
  publishedBeforeJoystream_not_in?: Maybe<Array<Scalars['DateTime']>>
  isPublic_isNull?: Maybe<Scalars['Boolean']>
  isPublic_eq?: Maybe<Scalars['Boolean']>
  isPublic_not_eq?: Maybe<Scalars['Boolean']>
  isCensored_isNull?: Maybe<Scalars['Boolean']>
  isCensored_eq?: Maybe<Scalars['Boolean']>
  isCensored_not_eq?: Maybe<Scalars['Boolean']>
  isExcluded_isNull?: Maybe<Scalars['Boolean']>
  isExcluded_eq?: Maybe<Scalars['Boolean']>
  isExcluded_not_eq?: Maybe<Scalars['Boolean']>
  nft_isNull?: Maybe<Scalars['Boolean']>
  nft?: Maybe<OwnedNftWhereInput>
  isExplicit_isNull?: Maybe<Scalars['Boolean']>
  isExplicit_eq?: Maybe<Scalars['Boolean']>
  isExplicit_not_eq?: Maybe<Scalars['Boolean']>
  license_isNull?: Maybe<Scalars['Boolean']>
  license?: Maybe<LicenseWhereInput>
  media_isNull?: Maybe<Scalars['Boolean']>
  media?: Maybe<StorageDataObjectWhereInput>
  videoStateBloatBond_isNull?: Maybe<Scalars['Boolean']>
  videoStateBloatBond_eq?: Maybe<Scalars['BigInt']>
  videoStateBloatBond_not_eq?: Maybe<Scalars['BigInt']>
  videoStateBloatBond_gt?: Maybe<Scalars['BigInt']>
  videoStateBloatBond_gte?: Maybe<Scalars['BigInt']>
  videoStateBloatBond_lt?: Maybe<Scalars['BigInt']>
  videoStateBloatBond_lte?: Maybe<Scalars['BigInt']>
  videoStateBloatBond_in?: Maybe<Array<Scalars['BigInt']>>
  videoStateBloatBond_not_in?: Maybe<Array<Scalars['BigInt']>>
  mediaMetadata_isNull?: Maybe<Scalars['Boolean']>
  mediaMetadata?: Maybe<VideoMediaMetadataWhereInput>
  createdInBlock_isNull?: Maybe<Scalars['Boolean']>
  createdInBlock_eq?: Maybe<Scalars['Int']>
  createdInBlock_not_eq?: Maybe<Scalars['Int']>
  createdInBlock_gt?: Maybe<Scalars['Int']>
  createdInBlock_gte?: Maybe<Scalars['Int']>
  createdInBlock_lt?: Maybe<Scalars['Int']>
  createdInBlock_lte?: Maybe<Scalars['Int']>
  createdInBlock_in?: Maybe<Array<Scalars['Int']>>
  createdInBlock_not_in?: Maybe<Array<Scalars['Int']>>
  subtitles_every?: Maybe<VideoSubtitleWhereInput>
  subtitles_some?: Maybe<VideoSubtitleWhereInput>
  subtitles_none?: Maybe<VideoSubtitleWhereInput>
  isCommentSectionEnabled_isNull?: Maybe<Scalars['Boolean']>
  isCommentSectionEnabled_eq?: Maybe<Scalars['Boolean']>
  isCommentSectionEnabled_not_eq?: Maybe<Scalars['Boolean']>
  pinnedComment_isNull?: Maybe<Scalars['Boolean']>
  pinnedComment?: Maybe<CommentWhereInput>
  comments_every?: Maybe<CommentWhereInput>
  comments_some?: Maybe<CommentWhereInput>
  comments_none?: Maybe<CommentWhereInput>
  commentsCount_isNull?: Maybe<Scalars['Boolean']>
  commentsCount_eq?: Maybe<Scalars['Int']>
  commentsCount_not_eq?: Maybe<Scalars['Int']>
  commentsCount_gt?: Maybe<Scalars['Int']>
  commentsCount_gte?: Maybe<Scalars['Int']>
  commentsCount_lt?: Maybe<Scalars['Int']>
  commentsCount_lte?: Maybe<Scalars['Int']>
  commentsCount_in?: Maybe<Array<Scalars['Int']>>
  commentsCount_not_in?: Maybe<Array<Scalars['Int']>>
  isReactionFeatureEnabled_isNull?: Maybe<Scalars['Boolean']>
  isReactionFeatureEnabled_eq?: Maybe<Scalars['Boolean']>
  isReactionFeatureEnabled_not_eq?: Maybe<Scalars['Boolean']>
  reactions_every?: Maybe<VideoReactionWhereInput>
  reactions_some?: Maybe<VideoReactionWhereInput>
  reactions_none?: Maybe<VideoReactionWhereInput>
  reactionsCountByReactionId_isNull?: Maybe<Scalars['Boolean']>
  reactionsCount_isNull?: Maybe<Scalars['Boolean']>
  reactionsCount_eq?: Maybe<Scalars['Int']>
  reactionsCount_not_eq?: Maybe<Scalars['Int']>
  reactionsCount_gt?: Maybe<Scalars['Int']>
  reactionsCount_gte?: Maybe<Scalars['Int']>
  reactionsCount_lt?: Maybe<Scalars['Int']>
  reactionsCount_lte?: Maybe<Scalars['Int']>
  reactionsCount_in?: Maybe<Array<Scalars['Int']>>
  reactionsCount_not_in?: Maybe<Array<Scalars['Int']>>
  viewsNum_isNull?: Maybe<Scalars['Boolean']>
  viewsNum_eq?: Maybe<Scalars['Int']>
  viewsNum_not_eq?: Maybe<Scalars['Int']>
  viewsNum_gt?: Maybe<Scalars['Int']>
  viewsNum_gte?: Maybe<Scalars['Int']>
  viewsNum_lt?: Maybe<Scalars['Int']>
  viewsNum_lte?: Maybe<Scalars['Int']>
  viewsNum_in?: Maybe<Array<Scalars['Int']>>
  viewsNum_not_in?: Maybe<Array<Scalars['Int']>>
  entryApp_isNull?: Maybe<Scalars['Boolean']>
  entryApp?: Maybe<AppWhereInput>
  ytVideoId_isNull?: Maybe<Scalars['Boolean']>
  ytVideoId_eq?: Maybe<Scalars['String']>
  ytVideoId_not_eq?: Maybe<Scalars['String']>
  ytVideoId_gt?: Maybe<Scalars['String']>
  ytVideoId_gte?: Maybe<Scalars['String']>
  ytVideoId_lt?: Maybe<Scalars['String']>
  ytVideoId_lte?: Maybe<Scalars['String']>
  ytVideoId_in?: Maybe<Array<Scalars['String']>>
  ytVideoId_not_in?: Maybe<Array<Scalars['String']>>
  ytVideoId_contains?: Maybe<Scalars['String']>
  ytVideoId_not_contains?: Maybe<Scalars['String']>
  ytVideoId_containsInsensitive?: Maybe<Scalars['String']>
  ytVideoId_not_containsInsensitive?: Maybe<Scalars['String']>
  ytVideoId_startsWith?: Maybe<Scalars['String']>
  ytVideoId_not_startsWith?: Maybe<Scalars['String']>
  ytVideoId_endsWith?: Maybe<Scalars['String']>
  ytVideoId_not_endsWith?: Maybe<Scalars['String']>
  videoRelevance_isNull?: Maybe<Scalars['Boolean']>
  videoRelevance_eq?: Maybe<Scalars['Float']>
  videoRelevance_not_eq?: Maybe<Scalars['Float']>
  videoRelevance_gt?: Maybe<Scalars['Float']>
  videoRelevance_gte?: Maybe<Scalars['Float']>
  videoRelevance_lt?: Maybe<Scalars['Float']>
  videoRelevance_lte?: Maybe<Scalars['Float']>
  videoRelevance_in?: Maybe<Array<Scalars['Float']>>
  videoRelevance_not_in?: Maybe<Array<Scalars['Float']>>
  isShort_isNull?: Maybe<Scalars['Boolean']>
  isShort_eq?: Maybe<Scalars['Boolean']>
  isShort_not_eq?: Maybe<Scalars['Boolean']>
  includeInHomeFeed_isNull?: Maybe<Scalars['Boolean']>
  includeInHomeFeed_eq?: Maybe<Scalars['Boolean']>
  includeInHomeFeed_not_eq?: Maybe<Scalars['Boolean']>
  AND?: Maybe<Array<VideoWhereInput>>
  OR?: Maybe<Array<VideoWhereInput>>
}

export type VideosConnection = {
  totalCount: Scalars['Int']
  edges: Array<VideoEdge>
  pageInfo: PageInfo
}

export type VideosSearchResult = {
  video: Video
  relevance: Scalars['Int']
}

export type WhereIdInput = {
  id: Scalars['String']
}

export type YppSuspended = {
  suspension: ChannelSuspension
}

export type YppUnverified = {
  phantom?: Maybe<Scalars['Int']>
}

export type YppVerified = {
  verification: ChannelVerification
}
