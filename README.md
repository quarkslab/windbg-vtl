# hv.js

`hv.js` is a [JavaScript](https://docs.microsoft.com/en-us/windows-hardware/drivers/debugger/javascript-debugger-scripting) 
debugger extension for WinDbg that allows to dump the partitions running on Hyper-V.


It has been used and tested against Hyper-v 19041.21.


## Usage

Run `.scriptload hv.js` to load the script. 

## Examples

* Dumping the existing partitions running on top of Hyper-V.

```text
1: kd> dx -r1 @$scripts.hv.Contents.hvExtension.HvInternals.getPartitions()
    @$scripts.hv.Contents.hvExtension.HvInternals.getPartitions()                 : [object Generator]
        [0x0]            : _HV_PARTITION *[0xffffe80000001000]
        [0x1]            : _HV_PARTITION *[0xffffe80200001000]
```

* Listing partition 0 properties  

```text
1: kd> dx -r1 @$scripts.hv.Contents.hvExtension.HvInternals.getPartitions()[0]
    @$scripts.hv.Contents.hvExtension.HvInternals.getPartitions()[0]                 : _HV_PARTITION *[0xffffe80000001000]
        PartitionProperty : 0x2bb9ff00003fff
        VirtualProcessorCount : 0x4
        VirtualProcessorList : Array of _HV_VP
        PartitionId      : 0x1
```

* Listing partition 0 Virtual Processors

```text
1: kd> dx -r1 @$scripts.hv.Contents.hvExtension.HvInternals.getPartitions()[0].VirtualProcessorList
    @$scripts.hv.Contents.hvExtension.HvInternals.getPartitions()[0].VirtualProcessorList                 : Array of _HV_VP
        [0x0]            : _HV_VP * [0xffffe80000669050]
        [0x1]            : _HV_VP * [0xffffe80000770050]
        [0x2]            : _HV_VP * [0xffffe80000793050]
        [0x3]            : _HV_VP * [0xffffe800007b1050]
```

* List VP 0 VTLs

```text
1: kd> dx -r1 @$scripts.hv.Contents.hvExtension.HvInternals.getPartitions()[0].VirtualProcessorList[0].VtlList
    @$scripts.hv.Contents.hvExtension.HvInternals.getPartitions()[0].VirtualProcessorList[0].VtlList                 : Array of _HV_VTL
    [0x0]            : _HV_VTL * [0xffffe8000066a000]
    [0x1]            : _HV_VTL * [0xffffe8000066c000]
```


* Partition 0 - VP0 VTL0 - VMCS 

``` text
1: kd> dx -r1 @$scripts.hv.Contents.hvExtension.HvInternals.getPartitions()[0].VirtualProcessorList[0].VtlList[0]
    @$scripts.hv.Contents.hvExtension.HvInternals.getPartitions()[0].VirtualProcessorList[0].VtlList[0]                 : _HV_VTL * [0xffffe8000066a000]
		VmcsProperties   : _HV_VMCS_PROPS * [0xffffe8000066b188]
```

* VMCS physical & virtual address

``` text
0: kd> dx -r1 @$scripts.hv.Contents.hvExtension.HvInternals.getPartitions()[0].VirtualProcessorList[0].VtlList[0].VmcsProperties.VmcsAddress
	@$scripts.hv.Contents.hvExtension.HvInternals.getPartitions()[0].VirtualProcessorList[0].VtlList[0].VmcsProperties.VmcsAddress                 : 0x10e586000,_HV_VPVTL_VMCS * [0xffffe80000672000]
		length           : 0x2
        [0x0]            : 0x10e586000
        [0x1]            : _HV_VPVTL_VMCS * [0xffffe80000672000
```
