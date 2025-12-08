#!/bin/bash

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
ORANGE='\033[0;33m'
NC='\033[0m' # No Color
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BASE_DIR="/root/splendor-blockchain-v4"
CORE_DIR="$BASE_DIR/Core-Blockchain"
TMP_DIR="/root/tmp"

#########################################################################
totalRpc=0
totalValidator=0
totalNodes=$(($totalRpc + $totalValidator))

isRPC=false
isValidator=false
node_type=""

#########################################################################

#+-----------------------------------------------------------------------------------------------+
#|                                                                                               |
#|                                           FUNCTIONS                                           |
#|                                                                                               |
#+-----------------------------------------------------------------------------------------------+

# Logger setup
log_step() {
  echo -e "${CYAN}➜ ${GREEN}$1${NC}"
}

log_success() {
  echo -e "${GREEN}✔ $1${NC}"
}

log_error() {
  echo -e "${RED}✖ $1${NC}"
}

log_wait() {
  echo -e "${CYAN}🕐 $1...${NC}"
}

log_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

progress_bar() {
  echo -en "${CYAN}["
  for i in {1..60}; do
    echo -en "#"
    sleep 0.01
  done
  echo -e "]${NC}"
}

# Check if we're in the correct directory and detect node type
check_environment_and_node_type() {
  log_step "Checking environment and detecting node type"
  
  if [ ! -d "$BASE_DIR" ]; then
    log_error "Splendor blockchain directory not found at $BASE_DIR"
    exit 1
  fi
  
  if [ ! -d "$CORE_DIR" ]; then
    log_error "Core blockchain directory not found at $CORE_DIR"
    exit 1
  fi
  
  # Check if node1 directory exists
  if [ ! -d "$CORE_DIR/chaindata/node1" ]; then
    log_error "No node1 directory found. Cannot determine node type."
    exit 1
  fi
  
  # Detect node type by checking for .validator or .rpc files
  if [ -f "$CORE_DIR/chaindata/node1/.validator" ]; then
    isValidator=true
    node_type="validator"
    log_success "Detected VALIDATOR node"
  elif [ -f "$CORE_DIR/chaindata/node1/.rpc" ]; then
    isRPC=true
    node_type="rpc"
    log_success "Detected RPC node"
  else
    log_error "Cannot determine node type. Neither .validator nor .rpc file found in node1 directory."
    exit 1
  fi
  
  log_success "Environment check passed"
}

# Create tmp directory and backup chaindata
backup_chaindata() {
  log_step "Backing up chaindata directory"
  
  # Create tmp directory if it doesn't exist
  if [ ! -d "$TMP_DIR" ]; then
    log_wait "Creating tmp directory at $TMP_DIR"
    mkdir -p "$TMP_DIR"
    log_success "Tmp directory created"
  fi
  
  # Backup entire chaindata directory
  if [ -d "$CORE_DIR/chaindata" ]; then
    log_wait "Backing up entire chaindata directory (this may take a while)"
    
    # Create chaindata backup with progress indication
    local chaindata_size=$(du -sh "$CORE_DIR/chaindata" | cut -f1)
    log_step "Chaindata size: $chaindata_size - Starting backup..."
    
    if cp -r "$CORE_DIR/chaindata" "$TMP_DIR/chaindata_backup"; then
      log_success "Chaindata directory backed up successfully"
    else
      log_error "Failed to backup chaindata directory"
      exit 1
    fi
  else
    log_warning "Chaindata directory not found at $CORE_DIR/chaindata"
  fi
  
  log_success "Chaindata backup completed"
}

# Legacy function for backward compatibility - now calls backup_chaindata
backup_validator_files() {
  backup_chaindata
}

# Stop running nodes
stop_nodes() {
  log_step "Stopping running nodes"
  
  cd "$CORE_DIR"
  
  if [ "$isValidator" = true ]; then
    log_wait "Stopping validator nodes"
    if [ -f "node-stop.sh" ]; then
      bash node-stop.sh --validator || log_warning "Failed to stop validator nodes gracefully"
    else
      log_error "node-stop.sh not found"
      exit 1
    fi
  elif [ "$isRPC" = true ]; then
    log_wait "Stopping RPC nodes"
    if [ -f "node-stop.sh" ]; then
      bash node-stop.sh --rpc || log_warning "Failed to stop RPC nodes gracefully"
    else
      log_error "node-stop.sh not found"
      exit 1
    fi
  fi
  
  log_success "Nodes stopped successfully"
}

# Remove old splendor-blockchain-v4 directory
remove_old_directory() {
  log_step "Removing old splendor-blockchain-v4 directory"
  
  cd /root/
  
  if [ -d "splendor-blockchain-v4" ]; then
    log_wait "Removing splendor-blockchain-v4 directory"
    rm -rf splendor-blockchain-v4
    log_success "Old directory removed"
  else
    log_warning "splendor-blockchain-v4 directory not found"
  fi
}

# Clone fresh repository
clone_repository() {
  log_step "Cloning fresh repository"
  
  cd /root/
  
  log_wait "Cloning https://github.com/Splendor-Protocol/splendor-blockchain-v4.git"
  if git clone https://github.com/Splendor-Protocol/splendor-blockchain-v4.git; then
    log_success "Repository cloned successfully"
  else
    log_error "Failed to clone repository"
    exit 1
  fi
}

# Setup node based on type
setup_node() {
  log_step "Setting up node based on detected type"
  
  cd "$CORE_DIR"
  
  if [ "$isValidator" = true ]; then
    log_wait "Setting up validator node with --nopk flag"
    if [ -f "node-setup.sh" ]; then
      bash node-setup.sh --validator 1 --nopk || {
        log_error "Failed to setup validator node"
        exit 1
      }
    else
      log_error "node-setup.sh not found"
      exit 1
    fi
  elif [ "$isRPC" = true ]; then
    log_wait "Setting up RPC node"
    if [ -f "node-setup.sh" ]; then
      bash node-setup.sh --rpc || {
        log_error "Failed to setup RPC node"
        exit 1
      }
    else
      log_error "node-setup.sh not found"
      exit 1
    fi
  fi
  
  log_success "Node setup completed"
}

# Restore chaindata directory
restore_chaindata() {
  log_step "Restoring chaindata directory"
  
  # Check if chaindata backup exists
  if [ -d "$TMP_DIR/chaindata_backup" ]; then
    log_wait "Restoring entire chaindata directory (this may take a while)"
    
    # Remove the new empty chaindata directory created by setup
    if [ -d "$CORE_DIR/chaindata" ]; then
      log_wait "Removing new empty chaindata directory"
      rm -rf "$CORE_DIR/chaindata"
      log_success "Empty chaindata directory removed"
    fi
    
    # Restore the backed up chaindata
    local backup_size=$(du -sh "$TMP_DIR/chaindata_backup" | cut -f1)
    log_step "Restoring chaindata backup (size: $backup_size)..."
    
    if cp -r "$TMP_DIR/chaindata_backup" "$CORE_DIR/chaindata"; then
      log_success "Chaindata directory restored successfully"
    else
      log_error "Failed to restore chaindata directory"
      exit 1
    fi
    
    # Verify restoration
    if [ -d "$CORE_DIR/chaindata" ]; then
      local restored_size=$(du -sh "$CORE_DIR/chaindata" | cut -f1)
      log_success "Chaindata restoration verified (size: $restored_size)"
    else
      log_error "Chaindata restoration verification failed"
      exit 1
    fi
  else
    log_warning "Chaindata backup not found at $TMP_DIR/chaindata_backup"
    log_warning "Proceeding with fresh chaindata (blockchain will need to sync from genesis)"
  fi
  
  log_success "Chaindata restore process completed"
}

# Legacy function for backward compatibility - now calls restore_chaindata
restore_validator_files() {
  restore_chaindata
}

# Create update completion flag for tracking
create_update_flag() {
  log_step "Creating update completion flag"
  
  # Use a persistent directory that won't get deleted during updates
  local flag_dir="/var/tmp"
  
  # Create flag file to signal update completion
  local flag_file="$flag_dir/splendor-update-completed"
  local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  local commit_hash=$(cd "$BASE_DIR" && git rev-parse HEAD 2>/dev/null || echo "unknown")
  
  cat > "$flag_file" << EOF
{
  "update_completed": true,
  "timestamp": "$timestamp",
  "commit_hash": "$commit_hash",
  "node_type": "$node_type",
  "script_version": "2.2"
}
EOF
  
  log_success "Update completion flag created at $flag_file"
}

# Cleanup and remove update files
cleanup_and_rename() {
  log_step "Cleaning up and removing files"
  
  cd /root/
  
  # Removing tmp directory
  if [ -d "$TMP_DIR" ]; then
    log_wait "Removing tmp directory"
    rm -rf "$TMP_DIR"
    log_success "tmp directory removed"
  fi
  
  # Remove update.sh
  if [ -f "/root/update.sh" ]; then
    log_wait "Removing update.sh"
    rm "/root/update.sh"
    log_success "update.sh removed"
  fi
  
  log_success "Cleanup completed"
}

# Display usage information
usage() {
  echo -e "\n${GREEN}Splendor Blockchain Update Script v2.2${NC}"
  echo -e "\nUsage: $0 [OPTIONS]"
  echo -e "\nOptions:"
  echo -e "\t-h, --help          Display this help message"
  echo -e "\nDescription:"
  echo -e "\tThis script automatically detects if the node is a validator or RPC,"
  echo -e "\tbacks up the entire chaindata directory, updates the blockchain,"
  echo -e "\tand restores the chaindata to preserve blockchain state and history."
  echo -e "\nFeatures:"
  echo -e "\t• Automatic node type detection (validator/RPC)"
  echo -e "\t• Complete chaindata backup and restore"
  echo -e "\t• Blockchain state preservation during updates"
  echo -e "\t• Update tracking and verification"
  echo -e "\nExample:"
  echo -e "\t$0                  # Run the update process with chaindata backup"
}

# Parse command line arguments
handle_options() {
  while [ $# -gt 0 ]; do
    case $1 in
      -h | --help)
        usage
        exit 0
        ;;
      *)
        echo -e "${RED}Invalid option: $1${NC}" >&2
        usage
        exit 1
        ;;
    esac
    shift
  done
}

# Main execution function
main() {
  echo -e "${GREEN}"
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║                 Splendor Blockchain Updater v2.2             ║"
  echo "║         Chaindata Backup + Auto Node Type Detection          ║"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo -e "${NC}\n"
  
  check_environment_and_node_type
  stop_nodes
  backup_chaindata
  remove_old_directory
  clone_repository
  setup_node
  restore_chaindata
  create_update_flag
  cleanup_and_rename
  
  echo -e "\n${GREEN}╔══════════════════════════════════════════════════════════════╗"
  echo "║                    Update Complete!                          ║"
  echo "║              Node Type: $(printf "%-8s" "$node_type")                        ║"
  echo "║          Update tracking flag created for reporting          ║"
  echo "╚══════════════════════════════════════════════════════════════╝${NC}"
  
  log_success "Splendor blockchain updated successfully"
  log_step "Now starting your $node_type node"
  cd $CORE_DIR
  ./node-start.sh --$node_type 
  cd $CORE_DIR
  
  log_step "Update completion will be automatically reported to tracking server"
  log_success "Update process completed with tracking enabled!"
}

# Script execution
handle_options "$@"
main
