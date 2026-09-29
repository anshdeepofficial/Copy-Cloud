import type { SvgIconComponent } from "@mui/icons-material";
import {
  ArchiveOutlined,
  ArrowBackRounded,
  AutoAwesomeOutlined,
  BoltOutlined,
  CheckRounded,
  CloseRounded,
  ContentCopyOutlined,
  ContentPasteOutlined,
  DarkModeOutlined,
  DeleteOutline,
  DescriptionOutlined,
  DesktopWindowsOutlined,
  DevicesOutlined,
  FileDownloadOutlined,
  FileUploadOutlined,
  ExpandMoreRounded,
  HistoryRounded,
  InboxOutlined,
  InfoOutlined,
  InsertDriveFileOutlined,
  LightModeOutlined,
  NearMeOutlined,
  OpenInNewRounded,
  PublicOutlined,
  RefreshRounded,
  ScheduleOutlined,
  SearchRounded,
  ShieldOutlined,
  TimerOutlined,
  UploadFileOutlined,
  VideocamOutlined,
  VisibilityOutlined,
  WorkOutline,
} from "@mui/icons-material";

export type GlassIconProps = { size?: number; className?: string };

function wrap(Icon: SvgIconComponent) {
  return function GlassIcon({ size = 16, className }: GlassIconProps) {
    return <Icon className={className} sx={{ fontSize: size }} aria-hidden="true" />;
  };
}

export const GlassSendIcon = wrap(NearMeOutlined);
export const GlassRetrieveIcon = wrap(FileDownloadOutlined);
export const GlassHistoryIcon = wrap(HistoryRounded);
export const GlassInfoIcon = wrap(InfoOutlined);
export const GlassLightIcon = wrap(LightModeOutlined);
export const GlassDarkIcon = wrap(DarkModeOutlined);
export const GlassSystemIcon = wrap(DesktopWindowsOutlined);
export const GlassSwitchIcon = wrap(AutoAwesomeOutlined);
export const GlassShieldIcon = wrap(ShieldOutlined);
export const GlassTimerIcon = wrap(TimerOutlined);
export const GlassBoltIcon = wrap(BoltOutlined);
export const GlassDevicesIcon = wrap(DevicesOutlined);
export const GlassCheckIcon = wrap(CheckRounded);
export const GlassTextIcon = wrap(DescriptionOutlined);
export const GlassFilesIcon = wrap(UploadFileOutlined);
export const GlassPasteIcon = wrap(ContentPasteOutlined);
export const GlassTrashIcon = wrap(DeleteOutline);
export const GlassCopyIcon = wrap(ContentCopyOutlined);
export const GlassRefreshIcon = wrap(RefreshRounded);
export const GlassUploadIcon = wrap(FileUploadOutlined);
export const GlassSearchIcon = wrap(SearchRounded);
export const GlassBackIcon = wrap(ArrowBackRounded);
export const GlassExternalIcon = wrap(OpenInNewRounded);
export const GlassChevronIcon = wrap(ExpandMoreRounded);
export const GlassEyeIcon = wrap(VisibilityOutlined);
export const GlassArchiveIcon = wrap(ArchiveOutlined);
export const GlassVideoIcon = wrap(VideocamOutlined);
export const GlassFileIcon = wrap(InsertDriveFileOutlined);
export const GlassCloseIcon = wrap(CloseRounded);
export const GlassInboxIcon = wrap(InboxOutlined);
export const GlassClockIcon = wrap(ScheduleOutlined);
export const GlassGlobeIcon = wrap(PublicOutlined);
export const GlassWorkIcon = wrap(WorkOutline);
