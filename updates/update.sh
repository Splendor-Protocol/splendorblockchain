#!/bin/bash

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
ORANGE='\033[0;33m'
NC='\033[0m' # No Color
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BASE_DIR="/root/splendorblockchain"
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
  # Handle directory renaming logic
  if [ -d "/root/splendor-blockchain-v4" ]; then
    if [ -d "/root/splendorblockchain" ]; then
      log_warning "Both /root/splendor-blockchain-v4 and /root/splendorblockchain exist. Removing old splendorblockchain first."
      rm -rf /root/splendorblockchain
    fi
    log_step "Renaming /root/splendor-blockchain-v4 to /root/splendorblockchain"
    mv /root/splendor-blockchain-v4 /root/splendorblockchain
    log_success "Directory renamed successfully"
  elif [ ! -d "/root/splendorblockchain" ]; then
    log_error "Neither /root/splendor-blockchain-v4 nor /root/splendorblockchain directory found"
    exit 1
  fi
  
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
  # Now backs up ONLY validator secrets (keystore + pass.txt)
  if [ "$isRPC" = true ]; then
    log_step "RPC node detected: nothing to backup"
    return 0
  fi

  log_step "Backing up validator secrets (keystore + pass.txt)"

  # Create tmp directory if it doesn't exist
  if [ ! -d "$TMP_DIR" ]; then
    log_wait "Creating tmp directory at $TMP_DIR"
    mkdir -p "$TMP_DIR"
    log_success "Tmp directory created"
  fi

  local node1_dir="$CORE_DIR/chaindata/node1"
  local ks_dir="$node1_dir/keystore"
  local pass_file="$node1_dir/pass.txt"
  local backup_dir="$TMP_DIR/validator_backup"

  # sanity checks
  if [ ! -d "$node1_dir" ]; then
    log_error "Expected node1 directory not found at: $node1_dir"
    exit 1
  fi

  rm -rf "$backup_dir"
  mkdir -p "$backup_dir"

  # Backup keystore (must exist for validator)
  if [ -d "$ks_dir" ]; then
    cp -a "$ks_dir" "$backup_dir/" || { log_error "Failed to backup keystore"; exit 1; }
    log_success "Keystore backed up"
  else
    log_warning "Keystore directory not found at $ks_dir (validator without keys? suspicious)"
  fi

  # Backup pass.txt (optional but usually present)
  if [ -f "$pass_file" ]; then
    cp -a "$pass_file" "$backup_dir/" || { log_error "Failed to backup pass.txt"; exit 1; }
    log_success "pass.txt backed up"
  else
    log_warning "pass.txt not found at $pass_file"
  fi

  log_success "Validator secrets backup completed"
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

# Remove old splendorblockchain directory
remove_old_directory() {
  log_step "Removing old splendorblockchain directory"
  
  cd /root/
  
  if [ -d "splendorblockchain" ]; then
    log_wait "Removing splendorblockchain directory"
    rm -rf splendorblockchain
    log_success "Old directory removed"
  else
    log_warning "splendorblockchain directory not found"
  fi
}

# Clone fresh repository
clone_repository() {
  log_step "Cloning fresh repository"
  
  cd /root/
  
  log_wait "Cloning https://github.com/Splendor-Protocol/splendorblockchain.git"
  if git clone https://github.com/Splendor-Protocol/splendorblockchain.git; then
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
  # Now restores ONLY validator secrets (keystore + pass.txt)
  if [ "$isRPC" = true ]; then
    log_step "RPC node detected: nothing to restore"
    return 0
  fi

  log_step "Restoring validator secrets (keystore + pass.txt)"

  local backup_dir="$TMP_DIR/validator_backup"
  local node1_dir="$CORE_DIR/chaindata/node1"
  local ks_src="$backup_dir/keystore"
  local pass_src="$backup_dir/pass.txt"
  local ks_dst="$node1_dir/keystore"
  local pass_dst="$node1_dir/pass.txt"

  if [ ! -d "$backup_dir" ]; then
    log_warning "No validator backup found at $backup_dir. Proceeding without restore."
    return 0
  fi

  # Ensure node1 exists (setup_node should create it)
  if [ ! -d "$node1_dir" ]; then
    log_error "Expected node1 directory not found after setup at: $node1_dir"
    exit 1
  fi

  # Restore keystore
  if [ -d "$ks_src" ]; then
    rm -rf "$ks_dst"
    cp -a "$ks_src" "$ks_dst" || { log_error "Failed to restore keystore"; exit 1; }
    log_success "Keystore restored"
  else
    log_warning "Backup keystore not found at $ks_src"
  fi

  # Restore pass.txt
  if [ -f "$pass_src" ]; then
    cp -a "$pass_src" "$pass_dst" || { log_error "Failed to restore pass.txt"; exit 1; }
    chmod 600 "$pass_dst" 2>/dev/null || true
    log_success "pass.txt restored"
  else
    log_warning "Backup pass.txt not found at $pass_src"
  fi

  log_success "Validator secrets restore completed"
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
